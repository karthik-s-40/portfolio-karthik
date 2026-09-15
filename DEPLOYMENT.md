# Portfolio Backend Cloud Deployment Guide (Render + Vercel)

This guide walks you through deploying your FastAPI backend to **Render** (100% free) and connecting it to your frontend on **Vercel**.

---

## Architecture Overview

- **Frontend**: Hosted on **Vercel** (Next.js).
- **Backend API**: Hosted on **Render** (FastAPI Web Service on free tier).
- **LLM Generation**: **Groq Cloud API** (Free tier, ultra-fast streaming responses without needing a local GPU or heavy RAM).
- **Embeddings**: Uses `embeddings.json` generated for your portfolio + Hugging Face / Ollama query embeddings.

---

## Step 1: Get a Free Groq API Key

1. Go to [https://console.groq.com](https://console.groq.com) and sign up (free).
2. Navigate to **API Keys** $\to$ **Create API Key**.
3. Name it (e.g. `portfolio-backend`) and copy the key (starts with `gsk_...`).

---

## Step 2: Push your Changes to GitHub

From your terminal in `portfolio-karthik`:

```bash
git add .
git commit -m "Configure backend for cloud deployment and dynamic API url"
git push origin main
```

---

## Step 3: Deploy Backend on Render (Free Web Service)

1. Go to [https://dashboard.render.com](https://dashboard.render.com) and sign in.
2. Click **New +** $\to$ **Web Service**.
3. Connect your GitHub repository: `portfolio-karthik`.
4. Configure the settings:
   - **Name**: `portfolio-karthik-backend` (or your choice)
   - **Region**: Select the closest region to you (e.g. `Singapore` or `Frankfurt`)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (or `.`)
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.api:application --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: `Free` (0.5 CPU, 512 MB RAM)

5. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `GROQ_API_KEY` | `gsk_...` | Your Groq API key from Step 1 |
   | `ALLOWED_ORIGINS` | `https://your-portfolio.vercel.app` | Your deployed Vercel URL |
   | `GROQ_MODEL` | `llama-3.1-8b-instant` | (Optional) Default fast model |

6. Click **Create Web Service**.
7. Wait 2–3 minutes for the build to finish. Once live, Render will give you a public URL such as:
   `https://portfolio-karthik-backend.onrender.com`

8. Test the health endpoint in your browser or curl:
   ```bash
   curl https://portfolio-karthik-backend.onrender.com/health
   ```
   You should see:
   ```json
   {"status":"ok","backend_mode":"cloud","llm_provider":"groq:llama-3.1-8b-instant","embeddings_loaded":25}
   ```

---

## Step 4: Connect Vercel Frontend to Render Backend

1. Go to your project on the [Vercel Dashboard](https://vercel.com/dashboard).
2. Navigate to **Settings** $\to$ **Environment Variables**.
3. Add a new variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://portfolio-karthik-backend.onrender.com` *(Replace with your actual Render URL, without trailing slash)*
   - **Environment**: Check **Production**, **Preview**, and **Development**.
4. Click **Save**.
5. Go to the **Deployments** tab in Vercel $\to$ click the three dots (`...`) on your latest deployment $\to$ **Redeploy** (this ensures Next.js bundles the new `NEXT_PUBLIC_API_URL`).

---

## Step 5: Test the Live Portfolio

1. Open your Vercel website URL.
2. Scroll to the **"Ask Karthik's AI"** section.
3. Ask a question (e.g. *"What machine learning projects have you worked on?"* or click one of the suggested prompts).
4. Watch the answer stream in real-time!
