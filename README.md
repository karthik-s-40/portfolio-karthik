# Karthik's Portfolio RAG Chatbot

An AI-powered Retrieval-Augmented Generation (RAG) chatbot for Karthik's developer portfolio. The chatbot answers questions about Karthik's skills, experience, projects, education, and achievements in the first person using local AI models via Ollama.

---

## 🌟 Key Features

- **Local & Privacy-Focused**: Runs entirely on your machine using [Ollama](https://ollama.com/) — no third-party API keys required.
- **Granular Semantic Chunking**: Dynamically chunks `data/about-me.txt` with extracted metadata (sections, titles, details).
- **Fast Embedding Retrieval**: Uses `all-minilm` to calculate cosine similarities across stored embeddings with grounded similarity thresholds.
- **First-Person Persona**: Uses `qwen3:1.7b` with a specialized system prompt to answer as Karthik.
- **Multiple Interfaces**:
  - **Interactive CLI**: Command-line interface with query rewriting and live stream output.
  - **FastAPI Backend**: Provides both full JSON (`POST /chat`) and Server-Sent Events streaming (`POST /chat/stream`) endpoints for frontend integration (e.g., Next.js).

---

## 🛠️ Prerequisites

1. **Python 3.9+** installed on your system.
2. **[Ollama](https://ollama.com/)** installed and running.
3. Pull the required models in Ollama:
   ```bash
   ollama pull all-minilm
   ollama pull qwen3:1.7b
   ```

---

## 📦 Installation & Setup

1. **Navigate to the project directory:**
   ```bash
   cd portfolio-karthik
   ```

2. **Activate the Virtual Environment:**

   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt):**
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - **macOS / Linux:**
     ```bash
     source venv/bin/activate
     ```

   *(If creating a fresh environment, run `python -m venv venv` first).*

3. **Install Dependencies:**
   ```bash
   pip install fastapi uvicorn requests numpy pydantic
   ```

---

## 🚀 How to Run

### 1. Ensure Ollama is Running
Make sure the Ollama daemon is active in the background:
```bash
ollama serve
```
Verify that the models are installed:
```bash
ollama list
```

---

### 2. Generate / Update Embeddings (Optional)
If you update the source text in `data/about-me.txt`, regenerate the vector embeddings database:
```bash
python generate-embeddings.py
```
This parses `data/about-me.txt`, computes embeddings using `all-minilm`, and saves them to `embeddings.json`.

---

### 3. Run the CLI Chatbot (Terminal Mode)
To test and interact with the chatbot directly in your terminal:
```bash
python chat.py
```
- Type any question when prompted (e.g., *"What machine learning projects has Karthik worked on?"*).
- Press **Enter** on an empty prompt to run the default sample question.
- Type `exit` or `quit` to end the session.

---

### 4. Run the FastAPI Server (Web / Frontend Integration)
To start the REST & Streaming API for a web frontend (e.g., Next.js / React):

```bash
python api.py
```
*Alternatively, run with Uvicorn directly:*
```bash
uvicorn api:application --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.
Interactive OpenAPI documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 📡 API Endpoints Reference

### 1. Health Check
- **Endpoint**: `GET /health`
- **Description**: Verifies Ollama connectivity and reports the number of loaded embeddings.
- **Example Request**:
  ```bash
  curl http://localhost:8000/health
  ```
- **Example Response**:
  ```json
  {
    "status": "ok",
    "ollama": "ok",
    "embeddings_loaded": 18
  }
  ```

---

### 2. Standard Chat (Full JSON Response)
- **Endpoint**: `POST /chat`
- **Description**: Retrieves relevant chunks and returns the complete answer with sources in a single response.
- **Request Body**:
  ```json
  {
    "question": "What are your core technical skills?"
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST http://localhost:8000/chat \
    -H "Content-Type: application/json" \
    -d "{\"question\": \"What are your core technical skills?\"}"
  ```
- **Example Response**:
  ```json
  {
    "answer": "My core technical skills include Python, SQL, Machine Learning, and web development with FastAPI and Next.js...",
    "sources": [
      {
        "section": "TECHNICAL SKILLS",
        "title": "Programming & Frameworks",
        "text": "Proficient in Python, SQL...",
        "similarity": 0.8124
      }
    ]
  }
  ```

---

### 3. Streaming Chat (Server-Sent Events)
- **Endpoint**: `POST /chat/stream`
- **Description**: Streams generated tokens in real-time as Server-Sent Events (SSE) for a live typing effect in web UIs.
- **Request Body**:
  ```json
  {
    "question": "Tell me about your portfolio projects."
  }
  ```
- **SSE Event Types**:
  - `event: token` &rarr; `data: {"token": "..."}`
  - `event: done` &rarr; `data: {"done": true}`
  - `event: error` &rarr; `data: {"error": "..."}`

#### Example: Frontend Integration (Next.js / React)
```typescript
async function streamChatResponse(question: string, onToken: (token: string) => void) {
  const response = await fetch("http://localhost:8000/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const payload = JSON.parse(line.replace("data: ", ""));
          if (payload.token) {
            onToken(payload.token);
          }
        } catch (e) {
          // ignore parsing error for non-json lines
        }
      }
    }
  }
}
```

---

## 📁 Project Structure

```
portfolio-karthik/
├── data/
│   └── about-me.txt          # Source portfolio text and background details
├── embeddings.json           # Granular semantic embeddings database
├── generate-embeddings.py    # Pipeline to chunk about-me.txt & embed via Ollama
├── chat.py                   # Retrieval logic & CLI chatbot
├── api.py                    # FastAPI server (standard & SSE streaming endpoints)
├── README.md                 # Project documentation and run instructions
└── venv/                     # Python virtual environment
```

---

## ⚙️ Configuration & Customization

You can adjust key parameters directly in `chat.py` and `api.py`:
- `DEFAULT_EMBEDDING_MODEL`: Embedding model (default: `all-minilm`)
- `DEFAULT_GENERATION_MODEL`: LLM generation model (default: `qwen3:1.7b`)
- `TOP_K_RELEVANT_CHUNKS`: Number of retrieved context chunks (default: `3`)
- `MINIMUM_SIMILARITY_THRESHOLD`: Cosine similarity cutoff threshold for retrieval (default: `0.35`)
- `CORS_ALLOWED_ORIGINS`: Allowed frontend origins in `api.py` (e.g., `http://localhost:3000`)
