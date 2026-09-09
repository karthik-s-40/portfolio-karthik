# Portfolio RAG Chatbot

A local portfolio assistant built for Karthik's professional profile. The system combines a semantic retrieval pipeline with an Ollama-backed language model to answer portfolio-related questions, while safely deflecting off-topic or personal prompts.

## Overview

This repository contains two modules:

1. Python backend for retrieval and generation
2. Next.js frontend for portfolio presentation and chat UI

The backend reads portfolio content from `data/about-me.txt`, creates embeddings, retrieves the most relevant document chunks, and generates grounded answers in first person. The frontend consumes the backend API and renders a polished chat experience.

## Architecture

```bash
Portfolio content (data/about-me.txt)
              ↓
     generate-embeddings.py
              ↓
        embeddings.json
              ↓
   chat.py / api.py
      ├─ query embedding
      ├─ semantic retrieval
      ├─ grounding checks
      └─ Ollama generation
              ↓
        Next.js frontend
```

## Core Features

- local-first AI using Ollama
- semantic embedding retrieval using `all-minilm`
- grounded portfolio answers based on source context
- first-person responses styled as the portfolio owner
- safe out-of-scope handling for casual or unrelated prompts
- both CLI and web API interfaces
- streaming chat support for frontend UX

## Prerequisites

Before running the project, install:

- Python 3.9+
- Node.js 18+
- npm
- Ollama

Then pull the required models:

```bash
ollama pull all-minilm
ollama pull qwen3:1.7b
```

## Project Structure

```bash
portfolio-karthik/
├── api.py
├── chat.py
├── generate-embeddings.py
├── embeddings.json
├── data/
│   └── about-me.txt
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── README.md
├── venv/
└── tests/
```

## Quick Start

### 1. Start Ollama

```bash
ollama serve
```

### 2. Activate the Python Environment

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Windows Command Prompt:

```cmd
.\venv\Scripts\activate.bat
```

### 3. Install Python dependencies

```bash
pip install fastapi uvicorn requests numpy pydantic
```

### 4. Regenerate embeddings if the source content changed

```bash
python generate-embeddings.py
```

### 5. Run the backend API

```bash
python api.py
```

or:

```bash
uvicorn api:application --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at:

- http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### 6. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

- http://localhost:3000

## Backend Behavior

### Retrieval pipeline

The backend performs the following:

- rewrite first-person questions into portfolio-friendly language
- embed the request using `all-minilm`
- compare the query vector against stored embeddings
- filter low-confidence matches
- retrieve the highest-similarity chunks
- build a grounded context prompt
- generate a final answer using Ollama

### Safety and deflection logic

The system is designed to remain professional and non-offensive.

- portfolio-related questions are answered from the corpus
- out-of-scope topics are deflected safely
- restricted topics such as political, racial, or explicit content are rejected or redirected
- casual questions are answered with a brief, light, non-offensive professional response

## API Reference

### Health check

```bash
curl http://localhost:8000/health
```

Response:

```json
{
  "status": "ok",
  "ollama": "ok",
  "embeddings_loaded": 18
}
```

### Standard chat

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"What are your core technical skills?"}'
```

### Streaming chat

```bash
curl -X POST http://localhost:8000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"question":"Tell me about your projects."}'
```

## Configuration Points

Key tuning values live in `chat.py` and `api.py`:

- `DEFAULT_EMBEDDING_MODEL`
- `DEFAULT_GENERATION_MODEL`
- `TOP_K_RELEVANT_CHUNKS`
- `MINIMUM_SIMILARITY_THRESHOLD`
- `STRONG_SIMILARITY_THRESHOLD`
- `CORS_ALLOWED_ORIGINS`

## Troubleshooting

### Ollama not responding

Check whether the model is installed:

```bash
ollama list
```

If needed, pull the models again:

```bash
ollama pull all-minilm
ollama pull qwen3:1.7b
```

### Backend cannot find embeddings

Regenerate the file:

```bash
python generate-embeddings.py
```

### Frontend cannot reach API

Confirm the backend is running on port 8000 and the frontend config matches that URL.

## Production Notes

This project is structured for local deployment and developer portfolio use. For production hosting, consider:

- moving the API to a managed backend service or VM
- securing the API behind authentication if needed
- running the frontend in a build-optimized deployment target
- keeping the Ollama service local or in a private environment

## License

This project is intended for portfolio and personal use. Adjust as needed for your own deployment and publishing requirements.
