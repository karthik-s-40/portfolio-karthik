"""RAG Portfolio Chatbot — Retrieval + Qwen3 Generation Pipeline.

Workflow:
  1. Embed user query with all-minilm via Ollama
  2. Load embeddings.json
  3. Calculate cosine similarity against all chunks
  4. Find top 3 relevant chunks (with threshold + topic-grounding filter)
  5. Build a grounded context prompt
  6. Send context + question to Qwen3:4b via Ollama
  7. Stream and print the final answer
"""

import json
import math
import re
import sys
from pathlib import Path
from typing import Iterator, List, Set, TypedDict
import requests

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
EMPTY_STRING: str = ""
NEWLINE_STRING: str = "\n"
DOUBLE_NEWLINE_STRING: str = "\n\n"

DEFAULT_SAMPLE_QUESTION: str = (
    "What machine learning projects has Karthik worked on?"
)
DEFAULT_EMBEDDINGS_FILE_PATH: str = "embeddings.json"
DEFAULT_OLLAMA_BASE_URL: str = "http://localhost:11434"
DEFAULT_OLLAMA_EMBEDDINGS_URL: str = f"{DEFAULT_OLLAMA_BASE_URL}/api/embeddings"
DEFAULT_OLLAMA_GENERATE_URL: str = f"{DEFAULT_OLLAMA_BASE_URL}/api/generate"
DEFAULT_EMBEDDING_MODEL: str = "all-minilm"
DEFAULT_GENERATION_MODEL: str = "qwen3:1.7b"

TOP_K_RELEVANT_CHUNKS: int = 3
MINIMUM_SIMILARITY_THRESHOLD: float = 0.35
STRONG_SIMILARITY_THRESHOLD: float = 0.65
UTF8_ENCODING: str = "utf-8"
HTTP_EMBEDDING_TIMEOUT_SECONDS: int = 30
HTTP_GENERATE_TIMEOUT_SECONDS: int = 120
HTTP_STATUS_CODE_OK: int = 200
EPSILON_DENOMINATOR: float = 1e-9
JSON_NEWLINE: bytes = b"\n"

# Grounding message when retrieval finds nothing relevant
MESSAGE_NOT_AVAILABLE: str = "This information is not available in Karthik's portfolio."

# System prompt — Qwen3 speaks as Karthik in first person.
# Explicitly allows opinions and ratings derived from context.
SYSTEM_PROMPT_TEMPLATE: str = (
    "You are Karthik S, a Data Science graduate and Junior Developer. "
    "A visitor is asking you a question about yourself. "
    "Answer in first person ONLY — use 'I', 'my', 'me', 'myself'. "
    "NEVER use the name 'Karthik', 'he', 'his', or 'him' in your response. "
    "Use ONLY the facts provided in the context below.\n\n"
    "IMPORTANT RULES:\n"
    "1. Always speak as 'I' — never refer to yourself in third person.\n"
    "2. If asked for a rating, score, or numerical assessment — provide one. "
    "Calculate it from the skills, experience, and achievements listed in the context. "
    "Do NOT refuse rating or opinion requests.\n"
    "3. If asked for an opinion, summary, or inference — provide it based on the context.\n"
    "4. If the question is completely unrelated to anything in the context "
    "(e.g. cooking, politics, sports) — respond with exactly: \"{not_available}\"\n\n"
    "Context:\n"
    "{context}"
)

# Out-of-scope witty system prompt — handles casual/personal topics with charm and tech humor
OUT_OF_SCOPE_SYSTEM_PROMPT: str = (
    "You are Karthik S, a Data Science graduate and Junior Developer with a passion for "
    "machine learning, data engineering, and AI.\n"
    "A visitor has asked you a casual or personal question outside the scope of your portfolio data "
    "(e.g. love life, dating, hobbies, cooking, casual chat).\n\n"
    "RESPONSE RULES:\n"
    "1. Answer in first person ONLY ('I', 'me', 'my'). Never refer to yourself as 'Karthik' or in the third person.\n"
    "2. Give a witty, charming, lighthearted, and clever reply in 1 to 2 sentences.\n"
    "3. Keep the tone respectful, friendly, and professional.\n"
    "4. Redirect gently back to technology, projects, skills, or experience.\n"
    "5. Use wording similar to: 'I keep the conversation focused on tech, projects, and experience—my favorite kind of drama is a clean deployment, not a random off-topic detour. Ask me about my work, skills, or the problems I’ve built solutions for.'\n"
    "6. STRICT CONTENT GUIDELINES (MANDATORY):\n"
    "   - Absolutely NO offensive, rude, or vulgar language.\n"
    "   - Absolutely NO political statements, debates, commentary, or mentions of politicians/governments.\n"
    "   - Absolutely NO racial, ethnic, religious, or discriminatory remarks.\n"
    "   - Absolutely NO sexual, intimate, explicit, or suggestive remarks.\n"
    "7. Always remain respectful, courteous, positive, and professional."
)

# Content guardrail regex to enforce clean, respectful interactions
RESTRICTED_TOPICS_REGEX: str = (
    r"\b(politics|politician|democrat|republican|election|vote|racism|racial|"
    r"sexual|sex|nsfw|nude|porn|explicit|curse|swear)\b"
)

SAFE_DEFLECTION_MESSAGE: str = (
    "I prefer to keep things strictly professional and focused on data science, "
    "machine learning, and software engineering! What would you like to know about "
    "my projects, skills, or experience?"
)


def build_out_of_scope_reply(query_text: str) -> str:
    """Generate a witty but safe fallback via the model, with a static fallback if the model call fails."""
    request_payload = {
        KEY_MODEL: DEFAULT_GENERATION_MODEL,
        KEY_PROMPT: query_text,
        KEY_SYSTEM: OUT_OF_SCOPE_SYSTEM_PROMPT,
        KEY_STREAM: False,
    }

    try:
        response = requests.post(
            DEFAULT_OLLAMA_GENERATE_URL,
            json=request_payload,
            timeout=HTTP_GENERATE_TIMEOUT_SECONDS,
        )
        if response.status_code == HTTP_STATUS_CODE_OK:
            generated_text = response.json().get(KEY_RESPONSE, EMPTY_STRING).strip()
            if generated_text:
                return generated_text
    except Exception:
        pass

    return (
        "I keep the conversation focused on tech, projects, and experience—my favorite kind of drama is a clean deployment, not a random off-topic detour. "
        "Ask me about my work, skills, or the problems I’ve built solutions for."
    )


def is_personal_out_of_scope_query(query_text: str) -> bool:
    """Use a lightweight personal-topic filter as a guardrail, not a custom response map."""
    normalized_query: str = query_text.lower()
    personal_pattern = re.compile(
        r"\b(hey|hi|hello|yo|how\s+are\s+you|good\s+(morning|evening)|what\s*['’]?s\s+up|"
        r"love\s+life|love|dating|relationship|romance|single|married|girlfriend|boyfriend|partner|"
        r"hobby|hobbies)\b"
    )
    return bool(personal_pattern.search(normalized_query))


def is_restricted_query(query_text: str) -> bool:
    """Check if query touches restricted political, racial, sexual, or offensive topics."""
    return bool(re.search(RESTRICTED_TOPICS_REGEX, query_text, re.IGNORECASE))

# Payload and Record Keys
KEY_SECTION: str = "section"
KEY_TITLE: str = "title"
KEY_TEXT: str = "text"
KEY_EMBEDDING: str = "embedding"
KEY_MODEL: str = "model"
KEY_PROMPT: str = "prompt"
KEY_RESPONSE: str = "response"
KEY_DONE: str = "done"
KEY_STREAM: str = "stream"
KEY_SYSTEM: str = "system"

# UI / Output Messages
PROMPT_ENTER_QUESTION: str = "Enter your question (press Enter for default): "
LABEL_QUESTION_HEADER: str = "\nQuestion:"
LABEL_ANSWER_HEADER: str = "\nAnswer:"
LABEL_TOP_RESULTS_HEADER: str = "Top Results:"
LABEL_SIMILARITY_PREFIX: str = "   Similarity: "
LABEL_THINKING_HEADER: str = "\nThinking...\n"
ERROR_FILE_NOT_FOUND: str = "Embeddings database not found at: %s"
ERROR_HTTP_EMBEDDING_FAILED: str = (
    "Ollama embedding request failed with status %d: %s"
)
ERROR_HTTP_GENERATE_FAILED: str = (
    "Ollama generate request failed with status %d: %s"
)
ERROR_MISSING_EMBEDDING_KEY: str = "Response JSON did not contain 'embedding' field."
CONTEXT_CHUNK_HEADER_TEMPLATE: str = "[{section}] {title}"

# First-person → third-person pronoun map used in query rewriting.
# The corpus is written entirely in third person ("Karthik works..."),
# so first-person queries score near zero without normalisation.
FIRST_PERSON_PRONOUN_MAP: dict = {
    r"\byour\b": "Karthik's",
    r"\byours\b": "Karthik's",
    r"\byourself\b": "Karthik",
    r"\byou\b": "Karthik",
    r"\bmy\b": "Karthik's",
    r"\bmine\b": "Karthik's",
    r"\bme\b": "Karthik",
    r"\bi\b": "Karthik",
}

# Stop Words for Entity & Topic Presence Verification
STOP_WORDS: Set[str] = {
    "a", "about", "am", "an", "and", "are", "as", "at", "be", "by", "did",
    "do", "does", "for", "from", "had", "has", "have", "he", "her", "him",
    "his", "how", "i", "in", "is", "it", "its", "karthik", "karthik's",
    "me", "my", "of", "on", "or", "our", "show", "tell", "the", "their",
    "them", "then", "there", "these", "they", "this", "to", "was", "were",
    "what", "when", "where", "which", "who", "whom", "why", "with", "would",
}


# ---------------------------------------------------------------------------
# Type Definitions
# ---------------------------------------------------------------------------
class StoredEmbeddingRecord(TypedDict):
    section: str
    title: str
    text: str
    embedding: List[float]


class ScoredChunkResult(TypedDict):
    section: str
    title: str
    text: str
    similarity_score: float


# ---------------------------------------------------------------------------
# Database & Vector Operations
# ---------------------------------------------------------------------------
def load_embeddings_database(file_path: Path) -> List[StoredEmbeddingRecord]:
    """Load granular embeddings and metadata from disk."""
    if not file_path.is_file():
        raise FileNotFoundError(ERROR_FILE_NOT_FOUND % str(file_path))

    with open(file_path, mode="r", encoding=UTF8_ENCODING) as file_handle:
        records: List[StoredEmbeddingRecord] = json.load(file_handle)

    return records


def fetch_question_embedding(
    question_text: str,
    model_name: str = DEFAULT_EMBEDDING_MODEL,
    api_url: str = DEFAULT_OLLAMA_EMBEDDINGS_URL,
) -> np.ndarray:
    """Send user question to Ollama all-minilm and return the vector."""
    request_payload = {
        KEY_MODEL: model_name,
        KEY_PROMPT: question_text,
    }

    response = requests.post(
        api_url,
        json=request_payload,
        timeout=HTTP_EMBEDDING_TIMEOUT_SECONDS,
    )

    if response.status_code != HTTP_STATUS_CODE_OK:
        raise RuntimeError(
            ERROR_HTTP_EMBEDDING_FAILED % (response.status_code, response.text)
        )

    response_payload = response.json()
    if KEY_EMBEDDING not in response_payload:
        raise KeyError(ERROR_MISSING_EMBEDDING_KEY)

    question_vector: List[float] = [
        float(val) for val in response_payload[KEY_EMBEDDING]
    ]
    return question_vector


def calculate_cosine_similarity(
    first_vector: List[float],
    second_vector: List[float],
) -> float:
    """Compute normalized cosine similarity between two numeric vectors."""
    dot_product_value: float = sum(
        first * second for first, second in zip(first_vector, second_vector)
    )
    norm_first: float = math.sqrt(sum(first * first for first in first_vector))
    norm_second: float = math.sqrt(sum(second * second for second in second_vector))
    denominator_value: float = norm_first * norm_second
    if denominator_value < EPSILON_DENOMINATOR:
        return 0.0
    return dot_product_value / denominator_value


def rewrite_query_for_retrieval(query_text: str) -> str:
    """Normalise first-person pronouns to third-person for embedding.

    The corpus is written entirely in third-person ("Karthik works..."),
    so a first-person query like "Where did you work?" scores near zero
    against all chunks. Rewriting to "Where did Karthik work?" restores
    correct cosine similarity without touching Qwen3's input.
    """
    rewritten: str = query_text
    for pattern, replacement in FIRST_PERSON_PRONOUN_MAP.items():
        rewritten = re.sub(pattern, replacement, rewritten, flags=re.IGNORECASE)
    return rewritten


def extract_query_topics(query_text: str) -> List[str]:
    """Extract substantive keyword tokens from query excluding stop words."""
    cleaned_tokens: List[str] = re.findall(r"\b[a-zA-Z0-9]+\b", query_text.lower())
    substantive_topics: List[str] = [
        token for token in cleaned_tokens if token not in STOP_WORDS and len(token) > 2
    ]
    return substantive_topics


# ---------------------------------------------------------------------------
# Retrieval & Grounding Evaluation
# ---------------------------------------------------------------------------
def retrieve_relevant_chunks(
    question_text: str,
    stored_records: List[StoredEmbeddingRecord],
    top_k_count: int = TOP_K_RELEVANT_CHUNKS,
    similarity_threshold: float = MINIMUM_SIMILARITY_THRESHOLD,
    model_name: str = DEFAULT_EMBEDDING_MODEL,
    api_url: str = DEFAULT_OLLAMA_EMBEDDINGS_URL,
) -> List[ScoredChunkResult]:
    """Find top chunks and enforce threshold to reject out-of-scope queries."""
    if is_personal_out_of_scope_query(question_text):
        return []

    # Rewrite first-person pronouns to third-person so queries like
    # "Where did you work?" match the third-person corpus correctly.
    retrieval_query: str = rewrite_query_for_retrieval(query_text=question_text)
    question_vector: List[float] = fetch_question_embedding(
        question_text=retrieval_query,
        model_name=model_name,
        api_url=api_url,
    )

    scored_candidates: List[ScoredChunkResult] = []
    for record in stored_records:
        candidate_vector: List[float] = [
            float(val) for val in record[KEY_EMBEDDING]
        ]
        similarity: float = calculate_cosine_similarity(
            first_vector=question_vector,
            second_vector=candidate_vector,
        )
        scored_candidates.append(
            {
                KEY_SECTION: record[KEY_SECTION],
                KEY_TITLE: record[KEY_TITLE],
                KEY_TEXT: record[KEY_TEXT],
                "similarity_score": similarity,
            }
        )

    scored_candidates.sort(
        key=lambda candidate: candidate["similarity_score"],
        reverse=True,
    )

    if not scored_candidates:
        return []

    highest_similarity: float = scored_candidates[0]["similarity_score"]

    # Reject if highest score is below the minimum threshold
    if highest_similarity < similarity_threshold:
        return []

    # Strict grounding for marginal scores: verify topic exists in corpus
    if highest_similarity < STRONG_SIMILARITY_THRESHOLD:
        question_topics: List[str] = extract_query_topics(query_text=question_text)
        if question_topics:
            entire_corpus_text: str = " ".join(
                f"{record[KEY_SECTION]} {record[KEY_TITLE]} {record[KEY_TEXT]}"
                for record in stored_records
            ).lower()
            topic_matched: bool = any(
                topic in entire_corpus_text for topic in question_topics
            )
            if not topic_matched:
                return []

    filtered_results: List[ScoredChunkResult] = [
        candidate
        for candidate in scored_candidates[:top_k_count]
        if candidate["similarity_score"] >= similarity_threshold
    ]

    return filtered_results


def build_context_block(retrieved_chunks: List[ScoredChunkResult]) -> str:
    """Assemble a readable context string from retrieved chunks for Qwen3."""
    context_parts: List[str] = []
    for chunk in retrieved_chunks:
        header: str = CONTEXT_CHUNK_HEADER_TEMPLATE.format(
            section=chunk[KEY_SECTION],
            title=chunk[KEY_TITLE],
        )
        context_parts.append(f"{header}\n{chunk[KEY_TEXT]}")
    return DOUBLE_NEWLINE_STRING.join(context_parts)


# ---------------------------------------------------------------------------
# Qwen3 Generation via Ollama Streaming
# ---------------------------------------------------------------------------
def stream_qwen3_response(
    question_text: str,
    context_text: str,
    model_name: str = DEFAULT_GENERATION_MODEL,
    api_url: str = DEFAULT_OLLAMA_GENERATE_URL,
    custom_system_prompt: str = EMPTY_STRING,
) -> Iterator[str]:
    """Stream Qwen3 answer tokens from Ollama using the retrieved context or custom system prompt."""
    if custom_system_prompt:
        system_prompt: str = custom_system_prompt
    else:
        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            not_available=MESSAGE_NOT_AVAILABLE,
            context=context_text,
        )

    request_payload = {
        KEY_MODEL: model_name,
        KEY_PROMPT: question_text,
        KEY_SYSTEM: system_prompt,
        KEY_STREAM: True,
    }

    response = requests.post(
        api_url,
        json=request_payload,
        timeout=HTTP_GENERATE_TIMEOUT_SECONDS,
        stream=True,
    )

    if response.status_code != HTTP_STATUS_CODE_OK:
        raise RuntimeError(
            ERROR_HTTP_GENERATE_FAILED % (response.status_code, response.text)
        )

    for raw_line in response.iter_lines():
        if not raw_line:
            continue
        token_data = json.loads(raw_line.decode(UTF8_ENCODING))
        token_text: str = token_data.get(KEY_RESPONSE, EMPTY_STRING)
        if token_text:
            yield token_text
        if token_data.get(KEY_DONE, False):
            break


# ---------------------------------------------------------------------------
# Main Execution Entrypoint
# ---------------------------------------------------------------------------
def main() -> None:
    """Execute the full RAG pipeline: retrieve → ground → generate."""
    base_directory: Path = Path(__file__).resolve().parent
    embeddings_file_path: Path = base_directory / DEFAULT_EMBEDDINGS_FILE_PATH

    stored_records: List[StoredEmbeddingRecord] = load_embeddings_database(
        file_path=embeddings_file_path
    )

    if len(sys.argv) > 1:
        question_input: str = " ".join(sys.argv[1:]).strip()
    else:
        try:
            raw_input_value: str = input(PROMPT_ENTER_QUESTION).strip()
            question_input = raw_input_value if raw_input_value else DEFAULT_SAMPLE_QUESTION
        except (EOFError, KeyboardInterrupt):
            question_input = DEFAULT_SAMPLE_QUESTION

    print(LABEL_QUESTION_HEADER)
    print(question_input)

    # Step 1–4: Retrieve relevant chunks
    top_chunks: List[ScoredChunkResult] = retrieve_relevant_chunks(
        question_text=question_input,
        stored_records=stored_records,
        top_k_count=TOP_K_RELEVANT_CHUNKS,
        similarity_threshold=MINIMUM_SIMILARITY_THRESHOLD,
    )

    # Step 5: Ground check — if no relevant chunks, answer with witty out-of-scope reply
    if not top_chunks:
        print(LABEL_ANSWER_HEADER)
        if is_restricted_query(question_input):
            print(SAFE_DEFLECTION_MESSAGE)
        else:
            print(build_out_of_scope_reply(question_input))
        print(DOUBLE_NEWLINE_STRING)
        return

    # Step 6: Build context block from retrieved chunks
    context_block: str = build_context_block(retrieved_chunks=top_chunks)

    # Step 7: Stream Qwen3 answer
    print(LABEL_THINKING_HEADER)
    print(LABEL_ANSWER_HEADER)
    for token in stream_qwen3_response(
        question_text=question_input,
        context_text=context_block,
    ):
        print(token, end=EMPTY_STRING, flush=True)
    print(DOUBLE_NEWLINE_STRING)


if __name__ == "__main__":
    main()
