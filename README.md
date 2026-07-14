# Groundwork

**Enterprise RAG system with hybrid search, cross-encoder reranking, and citation-grounded generation — every answer traces back to its exact source.**

[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-live%20API-009688)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Ragas](https://img.shields.io/badge/Ragas%20Faithfulness-1.00-brightgreen)](https://github.com/explodinggradients/ragas)

---

## Overview

Most "chat with your documents" tools give confident-sounding answers with no way to verify them. Groundwork is different: every claim in every answer is traced back to the exact chunk of the source document it came from, using a citation format (`[1]`, `[2]`, `[3]`) rendered directly in the chat UI.

Built end-to-end — document ingestion, hybrid retrieval, reranking, cited generation, observability, and quantitative evaluation — as a fully working full-stack application, not a notebook demo.

**Live demo:** https://groundwork-rag-one.vercel.app

---

## How it works

```
Document Upload
      │
      ▼
  Chunking (parent/child chunking strategy)
      │
      ▼
  Embedding (Hugging Face Inference API, all-MiniLM-L6-v2)
      │
      ▼
  Qdrant Cloud (vector storage — persists across deploys/restarts)
      │
      ▼
┌─────────────────────────────┐
│        Hybrid Search        │
│  Vector Search + BM25       │
│  fused via Reciprocal       │
│  Rank Fusion (RRF)          │
└─────────────────────────────┘
      │
      ▼
  Reranking (Cohere Rerank v3.5)
      │
      ▼
  Cited Generation (Groq — Llama 3.3 70B)
      │
      ▼
  Answer with [1] [2] [3] citations, rendered in chat UI
```

Every request is traced end-to-end with **Langfuse** for observability, and the full pipeline is scored with **Ragas** for faithfulness and answer relevancy.

---

## Key features

- **Hybrid retrieval** — combines semantic (vector) search with keyword (BM25) search, fused with Reciprocal Rank Fusion, so both meaning-based and exact-term matches are captured
- **Reranking** — a second, more precise relevance pass over the retrieval shortlist before generation
- **Citation-grounded generation** — answers cite the exact source chunk for every claim; no unverifiable statements
- **Multi-document support** — upload PDF, DOCX, or TXT files; filter chat to specific documents or search across all of them
- **Cloud-persisted vector storage** — Qdrant Cloud, so indexed documents survive backend restarts and redeploys
- **Full observability** — every retrieval and generation call traced with Langfuse
- **Quantitative evaluation** — pipeline scored with Ragas: **1.00 faithfulness**, **0.71 answer relevancy**
- **Live API** — FastAPI backend with interactive docs, not just scripts

---

## Tech stack

| Layer          | Technology                                       |
| -------------- | ------------------------------------------------- |
| Backend        | Python, FastAPI                                    |
| Embeddings     | Hugging Face Inference API (`all-MiniLM-L6-v2`)    |
| Vector store   | Qdrant Cloud                                       |
| Keyword search | BM25 (`rank_bm25`)                                 |
| Reranking      | Cohere Rerank (`rerank-v3.5`)                      |
| LLM            | Groq (Llama 3.3 70B)                               |
| Observability  | Langfuse                                           |
| Evaluation     | Ragas                                              |
| Frontend       | Next.js, TypeScript, Tailwind CSS                  |
| File parsing   | pypdf, python-docx                                 |
| Hosting        | Render (backend), Vercel (frontend)                |

---

## Evaluation results

Measured with [Ragas](https://github.com/explodinggradients/ragas) against the live pipeline:

| Metric           | Score    |
| ---------------- | -------- |
| Faithfulness     | **1.00** |
| Answer relevancy | **0.71** |

_Faithfulness measures whether the generated answer is fully supported by the retrieved context — a score of 1.0 means zero hallucination on the evaluated set._

---

## Project structure

```
groundwork-rag/
├── groundwork_backend/
│   ├── main.py              # FastAPI app — /ask, /upload, /documents, /analytics
│   ├── chunking.py          # Parent/child document chunking
│   ├── embeddings.py        # Embedding generation (HF Inference API)
│   ├── vector_store.py      # Qdrant storage and retrieval
│   ├── search.py            # Vector search, BM25, RRF, hybrid search
│   ├── reranker.py          # Reranking (Cohere Rerank API)
│   ├── generator.py         # Citation-grounded answer generation
│   ├── extract_text.py      # PDF/DOCX/TXT text extraction
│   └── evals.py             # Ragas evaluation pipeline
└── groundwork-frontend/
    ├── app/
    │   ├── page.tsx          # Landing page
    │   ├── chat/page.tsx     # Chat interface with citations
    │   ├── pricing/page.tsx  # Pricing page
    │   └── analytics/page.tsx # Usage analytics dashboard
```

---

## Getting started

### Backend

```bash
cd groundwork_backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Add your API keys to .env:
# GROQ_API_KEY=...
# HF_TOKEN=...
# COHERE_API_KEY=...
# QDRANT_URL=...
# QDRANT_API_KEY=...
# LANGFUSE_PUBLIC_KEY=...
# LANGFUSE_SECRET_KEY=...
# LANGFUSE_HOST=...

python -m uvicorn main:app --reload
```

API docs available at `http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd groundwork-frontend
npm install
npm run dev
```

App available at `http://localhost:3000`.

---

## API reference

| Endpoint           | Method | Description                                                    |
| ------------------ | ------ | -------------------------------------------------------------- |
| `/ask`             | GET    | Ask a question; optional `sources` param to filter by document |
| `/upload`          | POST   | Upload a PDF/DOCX/TXT file for indexing                        |
| `/documents`       | GET    | List indexed documents with chunk counts                       |
| `/analytics/stats` | GET    | Pipeline usage stats (via Langfuse)                             |
| `/health`          | GET    | Basic health check for hosting/uptime monitoring                |

Full interactive documentation at `/docs` (Swagger UI, auto-generated by FastAPI).

---

## Design notes

- **Authentication and multi-tenancy are intentionally omitted** from this demo to focus scope on the retrieval/generation pipeline. In production, this would use a session-based auth provider (e.g. NextAuth or Clerk) with per-user document isolation at the Qdrant payload level.
- **Vector storage was migrated from local ChromaDB to Qdrant Cloud** after hitting a real production constraint: free-tier hosting doesn't persist local disk writes across restarts/redeploys, which silently wiped indexed documents. Qdrant Cloud's free tier solves this by hosting vectors independently of the app server.
- **Embeddings were moved from a locally-loaded `sentence-transformers` model to the Hugging Face Inference API** after hitting free-tier memory limits (512MB) on Render — loading the model in-process alone exceeded the available memory.

---

## Roadmap

- [x] Persistent vector storage across deploys (Qdrant Cloud)
- [x] Frontend deployment (Vercel)
- [ ] Backend deployment verification on Render with current stack (Qdrant + HF Inference API)
- [ ] Authentication and per-user document isolation
- [ ] Streaming responses
- [ ] Support for additional file formats

---

## Author

**Sufiyan Khan** — [GitHub](https://github.com/SufyTech) · [X](https://x.com/sufii_tech)

Built as part of a #buildinpublic series documenting the development of a production-style RAG system from the ground up.
