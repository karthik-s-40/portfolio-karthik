"""FastAPI server wrapping the portfolio RAG pipeline.

Endpoints:
  GET  /health          – Liveness check: verifies Ollama is reachable and
                          embeddings.json exists.
  POST /chat            – Full JSON response. Accepts {"question": "..."} and
                          returns {"answer": "...", "sources": [...]} once
                          Qwen3 finishes generating.
  POST /chat/stream     – Server-Sent Events stream. Same request body; emits
                          tokens as they arrive so the UI can show a live
                          typing effect.

CORS is pre-configured for Next.js dev (localhost:3000) and allows any origin
in development so any local frontend can connect without configuration changes.
"""

import json
from pathlib import Path
from typing import AsyncIterator, List

import requests as sync_requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Re-use all existing RAG logic from chat.py — zero duplication
# ---------------------------------------------------------------------------
from chat import (
    DEFAULT_EMBEDDINGS_FILE_PATH,
    DEFAULT_GENERATION_MODEL,
    DEFAULT_OLLAMA_GENERATE_URL,
    DEFAULT_OLLAMA_EMBEDDINGS_URL,
    HTTP_STATUS_CODE_OK,
    KEY_DONE,
    KEY_MODEL,
    KEY_PROMPT,
    KEY_RESPONSE,
    KEY_SECTION,
    KEY_STREAM,
    KEY_SYSTEM,
    KEY_TEXT,
    KEY_TITLE,
    MESSAGE_NOT_AVAILABLE,
    MINIMUM_SIMILARITY_THRESHOLD,
    SYSTEM_PROMPT_TEMPLATE,
    TOP_K_RELEVANT_CHUNKS,
    UTF8_ENCODING,
    StoredEmbeddingRecord,
    ScoredChunkResult,
    build_context_block,
    load_embeddings_database,
    retrieve_relevant_chunks,
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
API_HOST: str = "0.0.0.0"
API_PORT: int = 8000
API_TITLE: str = "Karthik's Portfolio RAG API"
API_DESCRIPTION: str = (
    "Local RAG chatbot API for Karthik S's portfolio. "
    "Embeds queries with all-minilm, retrieves grounded context, "
    "and generates answers via Qwen3."
)
API_VERSION: str = "1.0.0"

HEALTH_STATUS_OK: str = "ok"
HEALTH_STATUS_ERROR: str = "error"
HEALTH_CHECK_PROMPT: str = "health"
HEALTH_CHECK_MODEL: str = "all-minilm"

CORS_ALLOWED_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://localhost:4000",
]

SSE_EVENT_TOKEN: str = "token"
SSE_EVENT_DONE: str = "done"
SSE_EVENT_ERROR: str = "error"
SSE_DATA_TEMPLATE: str = "event: {event}\ndata: {data}\n\n"
SSE_CONTENT_TYPE: str = "text/event-stream"
SSE_CACHE_CONTROL: str = "no-cache"
SSE_CONNECTION: str = "keep-alive"

ERROR_NO_QUESTION: str = "Question cannot be empty."
ERROR_GENERATE_FAILED: str = "Generation request failed: %s"
EMPTY_STRING: str = ""

# ---------------------------------------------------------------------------
# Application Setup
# ---------------------------------------------------------------------------
application: FastAPI = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
)

application.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load embeddings once at startup — shared across all requests
_base_dir: Path = Path(__file__).resolve().parent
_embeddings_path: Path = _base_dir / DEFAULT_EMBEDDINGS_FILE_PATH
stored_records: List[StoredEmbeddingRecord] = load_embeddings_database(
    file_path=_embeddings_path
)


# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    question: str


class SourceChunk(BaseModel):
    section: str
    title: str
    text: str
    similarity: float


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]


class HealthResponse(BaseModel):
    status: str
    ollama: str
    embeddings_loaded: int


# ---------------------------------------------------------------------------
# Helper: run Qwen3 generation (blocking, collects full response)
# ---------------------------------------------------------------------------
def generate_answer(question_text: str, context_text: str) -> str:
    """Call Ollama Qwen3 synchronously and return the complete answer."""
    system_prompt: str = SYSTEM_PROMPT_TEMPLATE.format(
        not_available=MESSAGE_NOT_AVAILABLE,
        context=context_text,
    )
    request_payload = {
        KEY_MODEL: DEFAULT_GENERATION_MODEL,
        KEY_PROMPT: question_text,
        KEY_SYSTEM: system_prompt,
        KEY_STREAM: False,
    }
    response = sync_requests.post(
        DEFAULT_OLLAMA_GENERATE_URL,
        json=request_payload,
        timeout=120,
    )
    if response.status_code != HTTP_STATUS_CODE_OK:
        raise HTTPException(
            status_code=502,
            detail=ERROR_GENERATE_FAILED % response.text,
        )
    return response.json().get(KEY_RESPONSE, EMPTY_STRING)


# ---------------------------------------------------------------------------
# Helper: stream Qwen3 generation as SSE tokens
# ---------------------------------------------------------------------------
async def stream_answer_sse(question_text: str, context_text: str) -> AsyncIterator[str]:
    """Yield Server-Sent Event chunks from Qwen3 for live UI streaming."""
    system_prompt: str = SYSTEM_PROMPT_TEMPLATE.format(
        not_available=MESSAGE_NOT_AVAILABLE,
        context=context_text,
    )
    request_payload = {
        KEY_MODEL: DEFAULT_GENERATION_MODEL,
        KEY_PROMPT: question_text,
        KEY_SYSTEM: system_prompt,
        KEY_STREAM: True,
    }

    try:
        response = sync_requests.post(
            DEFAULT_OLLAMA_GENERATE_URL,
            json=request_payload,
            timeout=120,
            stream=True,
        )
        for raw_line in response.iter_lines():
            if not raw_line:
                continue
            token_data = json.loads(raw_line.decode(UTF8_ENCODING))
            token_text: str = token_data.get(KEY_RESPONSE, EMPTY_STRING)
            if token_text:
                yield SSE_DATA_TEMPLATE.format(
                    event=SSE_EVENT_TOKEN,
                    data=json.dumps({"token": token_text}),
                )
            if token_data.get(KEY_DONE, False):
                break
        yield SSE_DATA_TEMPLATE.format(
            event=SSE_EVENT_DONE,
            data=json.dumps({"done": True}),
        )
    except Exception as generation_error:
        yield SSE_DATA_TEMPLATE.format(
            event=SSE_EVENT_ERROR,
            data=json.dumps({"error": str(generation_error)}),
        )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@application.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Verify Ollama is reachable and embeddings are loaded."""
    try:
        ping = sync_requests.post(
            DEFAULT_OLLAMA_EMBEDDINGS_URL,
            json={KEY_MODEL: HEALTH_CHECK_MODEL, KEY_PROMPT: HEALTH_CHECK_PROMPT},
            timeout=10,
        )
        ollama_status: str = HEALTH_STATUS_OK if ping.status_code == HTTP_STATUS_CODE_OK else HEALTH_STATUS_ERROR
    except Exception:
        ollama_status = HEALTH_STATUS_ERROR

    return HealthResponse(
        status=HEALTH_STATUS_OK,
        ollama=ollama_status,
        embeddings_loaded=len(stored_records),
    )


@application.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    """Retrieve relevant chunks and return a complete Qwen3 answer as JSON.

    Use this endpoint for a standard request/response integration in Next.js
    (e.g. with fetch or axios inside an API route or Server Action).
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail=ERROR_NO_QUESTION)

    top_chunks: List[ScoredChunkResult] = retrieve_relevant_chunks(
        question_text=request.question,
        stored_records=stored_records,
        top_k_count=TOP_K_RELEVANT_CHUNKS,
        similarity_threshold=MINIMUM_SIMILARITY_THRESHOLD,
    )

    if not top_chunks:
        return ChatResponse(
            answer=MESSAGE_NOT_AVAILABLE,
            sources=[],
        )

    context_block: str = build_context_block(retrieved_chunks=top_chunks)
    answer: str = generate_answer(
        question_text=request.question,
        context_text=context_block,
    )

    source_chunks: List[SourceChunk] = [
        SourceChunk(
            section=chunk[KEY_SECTION],
            title=chunk[KEY_TITLE],
            text=chunk[KEY_TEXT],
            similarity=round(chunk["similarity_score"], 4),
        )
        for chunk in top_chunks
    ]

    return ChatResponse(answer=answer, sources=source_chunks)


@application.post("/chat/stream")
def chat_stream(request: ChatRequest) -> StreamingResponse:
    """Retrieve relevant chunks and stream Qwen3 tokens as Server-Sent Events.

    Use this endpoint for a live typing effect in Next.js:
      const res = await fetch('/chat/stream', { method: 'POST', body: ... })
      const reader = res.body.getReader()
      // read tokens as they arrive
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail=ERROR_NO_QUESTION)

    top_chunks: List[ScoredChunkResult] = retrieve_relevant_chunks(
        question_text=request.question,
        stored_records=stored_records,
        top_k_count=TOP_K_RELEVANT_CHUNKS,
        similarity_threshold=MINIMUM_SIMILARITY_THRESHOLD,
    )

    if not top_chunks:
        async def _rejected_stream() -> AsyncIterator[str]:
            yield SSE_DATA_TEMPLATE.format(
                event=SSE_EVENT_TOKEN,
                data=json.dumps({"token": MESSAGE_NOT_AVAILABLE}),
            )
            yield SSE_DATA_TEMPLATE.format(
                event=SSE_EVENT_DONE,
                data=json.dumps({"done": True}),
            )

        return StreamingResponse(
            _rejected_stream(),
            media_type=SSE_CONTENT_TYPE,
            headers={
                "Cache-Control": SSE_CACHE_CONTROL,
                "Connection": SSE_CONNECTION,
            },
        )

    context_block: str = build_context_block(retrieved_chunks=top_chunks)

    return StreamingResponse(
        stream_answer_sse(
            question_text=request.question,
            context_text=context_block,
        ),
        media_type=SSE_CONTENT_TYPE,
        headers={
            "Cache-Control": SSE_CACHE_CONTROL,
            "Connection": SSE_CONNECTION,
        },
    )


# ---------------------------------------------------------------------------
# Dev entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:application", host=API_HOST, port=API_PORT, reload=True)
