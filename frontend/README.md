# Portfolio Frontend

This is the Next.js frontend for Karthik's portfolio and AI assistant experience. It renders the personal portfolio landing page and connects to the Python FastAPI backend for intelligent Q&A.

## Overview

The frontend is responsible for:

- presenting the portfolio sections and personal branding
- rendering the AI chat experience
- sending user questions to the backend streaming endpoint
- displaying the streamed answer in real time
- handling safe fallback states for out-of-scope queries

## Stack

- Next.js 15+
- React
- TypeScript
- Tailwind-style utility classes via custom CSS
- Framer Motion for transitions
- Lucide icons

## Project Structure

```bash
frontend/
├── app/
│   ├── components/
│   ├── data/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
└── README.md
```

## Configuration

The frontend expects the backend to run locally on:

- http://localhost:8000

This endpoint is configured in:

- `frontend/app/data/portfolio-data.ts`

Key config values include:

- `CHAT_CONFIG.streamEndpoint`
- suggestion chips and UI labels

## Local Development

From the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

Then open:

- http://localhost:3000

## Production Build

```bash
cd frontend
npm run build
npm run start
```

## Backend Dependency

The chat interface depends on the Python backend running in the project root:

```bash
cd ..
python backend/api.py
```

The API exposes:

- `POST /chat`
- `POST /chat/stream`
- `GET /health`

## Notes

- The frontend is intentionally lightweight and presentation-focused.
- Streaming responses are handled directly in `chat-section.tsx`.
- Personal or off-topic questions are handled by the backend guardrail logic to remain safe and professional.
- If the backend is not running, the UI will surface an API error state instead of failing silently.

## Common Commands

```bash
npm run dev
npm run build
npm run lint
npm run start
```

## Deployment

This frontend is designed to be deployed on any Node-compatible hosting provider such as Vercel, Netlify, or a custom container platform. The backend should be deployed separately or proxied behind the same origin in production.
