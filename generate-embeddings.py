"""Dynamic Granular Semantic Embedding Pipeline for Karthik's Portfolio RAG.

Reads and dynamically parses data/about-me.txt into granular semantic chunks
with metadata (section, title, text) extracted directly from the source text,
computes vector embeddings using Ollama (all-minilm), and saves the resulting
records to embeddings.json.
"""

import json
import logging
import time
from pathlib import Path
from typing import List, TypedDict
import requests

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
EMPTY_STRING: str = ""
NEWLINE_STRING: str = "\n"
DOUBLE_NEWLINE_STRING: str = "\n\n"
COLON_STRING: str = ":"
DASH_PREFIX: str = "-"
EM_DASH_STRING: str = "—"
PERIOD_STRING: str = "."
SENTENCE_DELIMITER: str = ". "

DEFAULT_INPUT_FILE_PATH: str = "data/about-me.txt"
DEFAULT_OUTPUT_FILE_PATH: str = "embeddings.json"
DEFAULT_OLLAMA_API_URL: str = "http://localhost:11434/api/embeddings"
DEFAULT_EMBEDDING_MODEL: str = "all-minilm"

UTF8_ENCODING: str = "utf-8"
JSON_INDENT_SPACES: int = 2
HTTP_REQUEST_TIMEOUT_SECONDS: int = 120
HTTP_STATUS_CODE_OK: int = 200
MAX_EMBEDDING_RETRIES: int = 3
RETRY_DELAY_SECONDS: float = 1.5
MAX_SECTION_HEADER_LENGTH: int = 40

# Section to Skip (LLM System Guidance, not Portfolio Content)
SECTION_SYSTEM_GUIDANCE: str = "PORTFOLIO CHATBOT GUIDANCE"

# JSON Payload and Record Keys
KEY_SECTION: str = "section"
KEY_TITLE: str = "title"
KEY_TEXT: str = "text"
KEY_EMBEDDING: str = "embedding"
KEY_MODEL: str = "model"
KEY_PROMPT: str = "prompt"

# Logging Messages
LOG_FORMAT: str = "%(asctime)s [%(levelname)s] %(message)s"
LOG_INFO_READING_FILE: str = "Reading source text from: %s"
LOG_INFO_PARSING_CHUNKS: str = "Dynamically parsing %s into granular semantic chunks..."
LOG_INFO_CHUNKS_PARSED: str = "Extracted %d dynamic semantic chunks from document."
LOG_INFO_FETCHING_EMBEDDINGS: str = "Generating embeddings using model '%s' via Ollama..."
LOG_INFO_CHUNK_PROGRESS: str = "Embedding chunk %d/%d: [%s] %s"
LOG_INFO_SAVING_EMBEDDINGS: str = "Saving embeddings to: %s"
LOG_INFO_COMPLETED_SUCCESSFULLY: str = "Successfully saved %d embedding records to %s!"
LOG_ERROR_FILE_NOT_FOUND: str = "Input file not found: %s"
LOG_ERROR_HTTP_REQUEST: str = "Ollama request failed with HTTP status %d: %s"
LOG_ERROR_MISSING_EMBEDDING: str = "Embedding key missing from response: %s"
LOG_WARNING_RETRY_ATTEMPT: str = "Attempt %d failed: %s. Retrying in %.1f seconds..."


# ---------------------------------------------------------------------------
# Type Definitions
# ---------------------------------------------------------------------------
class GranularChunkDefinition(TypedDict):
    section: str
    title: str
    text: str


class StoredEmbeddingRecord(TypedDict):
    section: str
    title: str
    text: str
    embedding: List[float]


# ---------------------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format=LOG_FORMAT)
application_logger: logging.Logger = logging.getLogger("generate_embeddings")


# ---------------------------------------------------------------------------
# Dynamic Document Parsing Logic
# ---------------------------------------------------------------------------
def parse_document_into_granular_chunks(raw_content: str) -> List[GranularChunkDefinition]:
    """Dynamically parse document text into granular semantic chunks with section and title.

    Derives sections from all-uppercase headers and titles directly from document
    lines (e.g. project names, internship roles, skill categories, certification lines),
    preserving the original content verbatim without hardcoded mockdata.
    """
    raw_paragraphs: List[str] = [
        paragraph.strip()
        for paragraph in raw_content.split(DOUBLE_NEWLINE_STRING)
        if paragraph.strip()
    ]

    extracted_chunks: List[GranularChunkDefinition] = []
    current_section: str = EMPTY_STRING
    paragraph_index: int = 0
    total_paragraphs: int = len(raw_paragraphs)

    while paragraph_index < total_paragraphs:
        current_paragraph: str = raw_paragraphs[paragraph_index]
        paragraph_lines: List[str] = [
            line.strip() for line in current_paragraph.splitlines() if line.strip()
        ]

        # Top-level all-caps section header (e.g. PROJECTS, TECHNICAL SKILLS)
        is_single_line: bool = len(paragraph_lines) == 1
        is_all_caps: bool = current_paragraph.isupper()
        is_short_header: bool = len(current_paragraph) <= MAX_SECTION_HEADER_LENGTH

        if is_single_line and is_all_caps and is_short_header:
            current_section = current_paragraph
            paragraph_index += 1
            continue

        # Skip internal guidance instructions intended only for the chatbot prompt
        if current_section == SECTION_SYSTEM_GUIDANCE:
            paragraph_index += 1
            continue

        first_line: str = paragraph_lines[0]

        # 1. Technical Skills: Title is the category name preceding the colon
        has_sub_bullets: bool = any(line.startswith(DASH_PREFIX) for line in paragraph_lines[1:])
        if first_line.endswith(COLON_STRING) and has_sub_bullets:
            category_title: str = first_line.rstrip(COLON_STRING)
            extracted_chunks.append({
                KEY_SECTION: current_section,
                KEY_TITLE: category_title,
                KEY_TEXT: current_paragraph,
            })
            paragraph_index += 1
            continue

        # 2. Key-value metadata block followed by intro sentence and bullet list (e.g. Current Role)
        # Dynamically pairs entity metadata with the introductory overview statement for complete context,
        # and pairs the lead-in sentence with the detailed responsibilities bullet list.
        is_key_value_block: bool = (
            len(paragraph_lines) > 1
            and all(COLON_STRING in line for line in paragraph_lines)
        )
        has_intro_and_bullets: bool = (
            paragraph_index + 2 < total_paragraphs
            and raw_paragraphs[paragraph_index + 1].endswith(COLON_STRING)
            and any(line.startswith(DASH_PREFIX) for line in raw_paragraphs[paragraph_index + 2].splitlines())
        )
        if is_key_value_block and has_intro_and_bullets:
            intro_paragraph: str = raw_paragraphs[paragraph_index + 1]
            bullet_paragraph: str = raw_paragraphs[paragraph_index + 2]
            intro_sentences: List[str] = [
                sentence.strip()
                for sentence in intro_paragraph.split(SENTENCE_DELIMITER)
                if sentence.strip()
            ]
            if len(intro_sentences) > 1:
                overview_text: str = (
                    f"{current_paragraph}{DOUBLE_NEWLINE_STRING}{intro_sentences[0]}{PERIOD_STRING}"
                )
            else:
                overview_text = f"{current_paragraph}{DOUBLE_NEWLINE_STRING}{intro_paragraph}"

            role_title: str = (
                first_line.split(COLON_STRING)[1].strip()
                if COLON_STRING in first_line
                else first_line
            )
            extracted_chunks.append({
                KEY_SECTION: current_section,
                KEY_TITLE: role_title,
                KEY_TEXT: overview_text,
            })

            responsibilities_text: str = f"{intro_paragraph}{NEWLINE_STRING}{bullet_paragraph}"
            responsibilities_title: str = (
                intro_sentences[0] if intro_sentences else role_title
            )
            extracted_chunks.append({
                KEY_SECTION: current_section,
                KEY_TITLE: responsibilities_title,
                KEY_TEXT: responsibilities_text,
            })
            paragraph_index += 3
            continue

        # 3. Intro sentence ending in colon followed by bullet list
        ends_with_colon: bool = current_paragraph.endswith(COLON_STRING) or first_line.endswith(COLON_STRING)
        has_following_bullets: bool = (
            paragraph_index + 1 < total_paragraphs
            and any(line.startswith(DASH_PREFIX) for line in raw_paragraphs[paragraph_index + 1].splitlines())
        )
        if ends_with_colon and has_following_bullets:
            group_title: str = (
                first_line.split(PERIOD_STRING)[0].strip()
                if PERIOD_STRING in first_line
                else first_line.rstrip(COLON_STRING)
            )
            combined_bullet_block: str = (
                f"{current_paragraph}{NEWLINE_STRING}{raw_paragraphs[paragraph_index + 1]}"
            )
            extracted_chunks.append({
                KEY_SECTION: current_section,
                KEY_TITLE: group_title,
                KEY_TEXT: combined_bullet_block,
            })
            paragraph_index += 2
            continue

        # 3. Standalone bullet list (e.g. Certifications): Each bullet is its own granular chunk
        is_pure_bullet_list: bool = all(line.startswith(DASH_PREFIX) for line in paragraph_lines)
        if is_pure_bullet_list:
            for bullet_line in paragraph_lines:
                cleaned_line: str = bullet_line.lstrip("- ")
                bullet_title: str = (
                    cleaned_line.split(EM_DASH_STRING)[0].strip()
                    if EM_DASH_STRING in cleaned_line
                    else cleaned_line
                )
                extracted_chunks.append({
                    KEY_SECTION: current_section,
                    KEY_TITLE: bullet_title,
                    KEY_TEXT: cleaned_line,
                })
            paragraph_index += 1
            continue

        # 4. Two-paragraph items: Projects, Internships (paragraph 1 metadata + paragraph 2 description)
        if paragraph_index + 1 < total_paragraphs:
            next_paragraph: str = raw_paragraphs[paragraph_index + 1]
            next_lines: List[str] = [line.strip() for line in next_paragraph.splitlines() if line.strip()]
            is_next_header: bool = (
                next_paragraph.isupper()
                and len(next_lines) == 1
                and len(next_paragraph) <= MAX_SECTION_HEADER_LENGTH
            )
            is_project_or_internship_meta: bool = (
                (COLON_STRING in current_paragraph and len(paragraph_lines) > 1)
                or (EM_DASH_STRING in first_line and any(char.isdigit() for char in current_paragraph))
            )
            if is_project_or_internship_meta and not is_next_header and not next_paragraph.endswith(COLON_STRING):
                item_title: str = (
                    first_line.split(EM_DASH_STRING)[0].strip()
                    if EM_DASH_STRING in first_line
                    else first_line
                )
                combined_entity_block: str = (
                    f"{current_paragraph}{DOUBLE_NEWLINE_STRING}{next_paragraph}"
                )
                extracted_chunks.append({
                    KEY_SECTION: current_section,
                    KEY_TITLE: item_title,
                    KEY_TEXT: combined_entity_block,
                })
                paragraph_index += 2
                continue

        # 5. Standard paragraph chunk: Derive title from the first line or current section name
        if COLON_STRING in first_line and len(first_line.split(COLON_STRING)[0]) < 25:
            paragraph_title: str = first_line.split(COLON_STRING)[0].strip()
        elif len(first_line) < 45:
            paragraph_title = first_line
        else:
            paragraph_title = current_section.title() if current_section else first_line[:30]

        extracted_chunks.append({
            KEY_SECTION: current_section,
            KEY_TITLE: paragraph_title,
            KEY_TEXT: current_paragraph,
        })
        paragraph_index += 1

    application_logger.info(LOG_INFO_CHUNKS_PARSED, len(extracted_chunks))
    return extracted_chunks


# ---------------------------------------------------------------------------
# Embedding Vector Generation
# ---------------------------------------------------------------------------
def fetch_embedding_vector(
    embed_content: str,
    model_name: str = DEFAULT_EMBEDDING_MODEL,
    api_url: str = DEFAULT_OLLAMA_API_URL,
) -> List[float]:
    """Call Ollama embeddings endpoint with retry mechanism to generate vector."""
    request_payload = {
        KEY_MODEL: model_name,
        KEY_PROMPT: embed_content,
    }

    last_exception: Exception | None = None
    for attempt in range(1, MAX_EMBEDDING_RETRIES + 1):
        try:
            response = requests.post(
                api_url,
                json=request_payload,
                timeout=HTTP_REQUEST_TIMEOUT_SECONDS,
            )

            if response.status_code != HTTP_STATUS_CODE_OK:
                application_logger.error(
                    LOG_ERROR_HTTP_REQUEST, response.status_code, response.text
                )
                response.raise_for_status()

            response_json = response.json()
            if KEY_EMBEDDING not in response_json:
                application_logger.error(
                    LOG_ERROR_MISSING_EMBEDDING, str(response_json)
                )
                raise KeyError(f"Expected '{KEY_EMBEDDING}' key in Ollama response.")

            embedding_vector: List[float] = response_json[KEY_EMBEDDING]
            return embedding_vector

        except (requests.exceptions.RequestException, KeyError) as err:
            last_exception = err
            if attempt < MAX_EMBEDDING_RETRIES:
                application_logger.warning(
                    LOG_WARNING_RETRY_ATTEMPT,
                    attempt,
                    str(err),
                    RETRY_DELAY_SECONDS,
                )
                time.sleep(RETRY_DELAY_SECONDS)

    if last_exception:
        raise last_exception
    raise RuntimeError("Failed to obtain embedding from Ollama.")


def generate_granular_embeddings(
    chunk_definitions: List[GranularChunkDefinition],
    model_name: str = DEFAULT_EMBEDDING_MODEL,
    api_url: str = DEFAULT_OLLAMA_API_URL,
) -> List[StoredEmbeddingRecord]:
    """Iterate through dynamically parsed chunks, embed them, and store metadata."""
    application_logger.info(LOG_INFO_FETCHING_EMBEDDINGS, model_name)
    stored_records: List[StoredEmbeddingRecord] = []
    total_chunks: int = len(chunk_definitions)

    for index, chunk_item in enumerate(chunk_definitions, start=1):
        application_logger.info(
            LOG_INFO_CHUNK_PROGRESS,
            index,
            total_chunks,
            chunk_item[KEY_SECTION],
            chunk_item[KEY_TITLE],
        )

        embed_text: str = (
            f"[{chunk_item[KEY_SECTION]} - {chunk_item[KEY_TITLE]}]\n"
            f"{chunk_item[KEY_TEXT]}"
        )

        vector: List[float] = fetch_embedding_vector(
            embed_content=embed_text,
            model_name=model_name,
            api_url=api_url,
        )

        record: StoredEmbeddingRecord = {
            KEY_SECTION: chunk_item[KEY_SECTION],
            KEY_TITLE: chunk_item[KEY_TITLE],
            KEY_TEXT: chunk_item[KEY_TEXT],
            KEY_EMBEDDING: vector,
        }
        stored_records.append(record)

    return stored_records


def save_embeddings_to_json(
    records: List[StoredEmbeddingRecord],
    destination_path: Path,
) -> None:
    """Save the list of dynamically generated embedding records to disk in JSON format."""
    application_logger.info(LOG_INFO_SAVING_EMBEDDINGS, str(destination_path))
    destination_path.parent.mkdir(parents=True, exist_ok=True)

    with open(destination_path, mode="w", encoding=UTF8_ENCODING) as destination_file:
        json.dump(
            records,
            destination_file,
            indent=JSON_INDENT_SPACES,
            ensure_ascii=False,
        )

    application_logger.info(
        LOG_INFO_COMPLETED_SUCCESSFULLY,
        len(records),
        str(destination_path),
    )


# ---------------------------------------------------------------------------
# Main Pipeline Entrypoint
# ---------------------------------------------------------------------------
def main() -> None:
    """Execute end-to-end dynamic embedding pipeline reading from about-me.txt."""
    base_directory: Path = Path(__file__).resolve().parent
    input_file_path: Path = base_directory / DEFAULT_INPUT_FILE_PATH
    output_file_path: Path = base_directory / DEFAULT_OUTPUT_FILE_PATH

    application_logger.info(LOG_INFO_READING_FILE, str(input_file_path))
    if not input_file_path.is_file():
        application_logger.error(LOG_ERROR_FILE_NOT_FOUND, str(input_file_path))
        raise FileNotFoundError(f"Input file not found at: {input_file_path}")

    with open(input_file_path, mode="r", encoding=UTF8_ENCODING) as source_file:
        raw_text: str = source_file.read()

    chunk_definitions: List[GranularChunkDefinition] = (
        parse_document_into_granular_chunks(raw_content=raw_text)
    )

    records: List[StoredEmbeddingRecord] = generate_granular_embeddings(
        chunk_definitions=chunk_definitions,
        model_name=DEFAULT_EMBEDDING_MODEL,
        api_url=DEFAULT_OLLAMA_API_URL,
    )

    save_embeddings_to_json(
        records=records,
        destination_path=output_file_path,
    )


if __name__ == "__main__":
    main()
