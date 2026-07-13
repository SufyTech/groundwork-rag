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

**Live demo:** _coming soon — deployment in progress_

---

## How it works

```
Document Upload
      │
      ▼
  Chunking (parent/child chunking strategy)
      │
      ▼
  Embedding (sentence-transformers, all-MiniLM-L6-v2)
      │
      ▼
  ChromaDB (vector storage)
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
  Cross-Encoder Reranking (ms-marco-MiniLM-L-6-v2)
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
- **Cross-encoder reranking** — a second, more precise pass over the retrieval shortlist before generation
- **Citation-grounded generation** — answers cite the exact source chunk for every claim; no unverifiable statements
- **Multi-document support** — upload PDF, DOCX, or TXT files; filter chat to specific documents or search across all of them
- **Full observability** — every retrieval and generation call traced with Langfuse
- **Quantitative evaluation** — pipeline scored with Ragas: **1.00 faithfulness**, **0.71 answer relevancy**
- **Live API** — FastAPI backend with interactive docs, not just scripts

---

## Tech stack

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Backend        | Python, FastAPI                            |
| Embeddings     | sentence-transformers (`all-MiniLM-L6-v2`) |
| Vector store   | ChromaDB                                   |
| Keyword search | BM25 (`rank_bm25`)                         |
| Reranking      | Cross-encoder (`ms-marco-MiniLM-L-6-v2`)   |
| LLM            | Groq (Llama 3.3 70B)                       |
| Observability  | Langfuse                                   |
| Evaluation     | Ragas                                      |
| Frontend       | Next.js, TypeScript, Tailwind CSS          |
| File parsing   | pypdf, python-docx                         |

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
│   ├── embeddings.py        # Embedding generation
│   ├── vector_store.py      # ChromaDB storage and retrieval
│   ├── search.py            # Vector search, BM25, RRF, hybrid search
│   ├── reranker.py          # Cross-encoder reranking
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
| `/analytics/stats` | GET    | Pipeline usage stats (via Langfuse)                            |

Full interactive documentation at `/docs` (Swagger UI, auto-generated by FastAPI).

---

## Roadmap

- [ ] Production deployment (Vercel + Railway/Render)
- [ ] Authentication and per-user document isolation
- [ ] Streaming responses
- [ ] Support for additional file formats

---

## Author

**Sufiyan Khan** — [GitHub](https://github.com/SufyTech) · [X](https://x.com/sufii_tech)

Built as part of a #buildinpublic series documenting the development of a production-style RAG system from the ground up.
