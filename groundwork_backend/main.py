import os
import requests as http_requests
from fastapi import FastAPI, UploadFile, File
from vector_store import collection, get_chunk_texts, store_records, get_documents
from search import build_bm25_index, search_and_rerank, hybrid_search
from generator import generate_answer
from chunking import chunk_document
from embeddings import embed_chunks
from extract_text import extract_text_from_file
from fastapi.middleware.cors import CORSMiddleware
import re
from collections import defaultdict
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state, rebuilt whenever documents change
all_ids = []
all_texts = []
bm25 = None

def rebuild_index():
    global all_ids, all_texts, bm25
    all_data = collection.get()
    all_ids = all_data['ids']
    all_texts = all_data['documents']
    bm25 = build_bm25_index(all_texts) if all_texts else None

rebuild_index()

def safe_doc_id(filename: str) -> str:
    return re.sub(r"[^a-zA-Z0-9]+", "_", filename).strip("_")

@app.get("/ask")
def ask(question: str, sources: str = None):
    selected = [s for s in sources.split(",") if s] if sources else None

    if selected:
        where = {"source": {"$in": selected}}
        filtered = collection.get(where=where)
        filtered_ids = filtered['ids']
        filtered_texts = filtered['documents']
        if not filtered_ids:
            return {"question": question, "answer": "No matching documents found for the selected sources."}
        local_bm25 = build_bm25_index(filtered_texts)
        fused = hybrid_search(question, collection, local_bm25, filtered_ids)
        fused = [f for f in fused if f[0] in filtered_ids]
        pulled_ids = [chunk_id for chunk_id, score in fused][:10]
        from vector_store import get_chunk_texts as gct
        from reranker import rerank
        chunks_text = gct(pulled_ids)
        reranked = rerank(question, chunks_text, top_k=5)
        answer = generate_answer(question, reranked)
    else:
        reranked = search_and_rerank(question, collection, bm25, all_ids)
        answer = generate_answer(question, reranked)

    return {"question": question, "answer": answer}

@app.get("/documents")
def documents():
    return {"documents": get_documents()}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    file_bytes = await file.read()
    text = extract_text_from_file(file.filename, file_bytes)

    doc_id = safe_doc_id(file.filename)
    chunks = chunk_document(text, doc_id=doc_id)
    records = embed_chunks(chunks, source=file.filename)
    store_records(records)

    rebuild_index()

    return {
        "filename": file.filename,
        "chunks_added": len(records),
        "status": "indexed"
    }

from generator import langfuse

def extract_question_text(trace_input):
    """Langfuse stores @observe() args as {'args': [...], 'kwargs': {...}}"""
    if not trace_input:
        return None
    if isinstance(trace_input, dict):
        args = trace_input.get("args", [])
        if args and isinstance(args[0], str):
            return args[0]
        kwargs = trace_input.get("kwargs", {})
        if "query_text" in kwargs:
            return kwargs["query_text"]
    return None

@app.get("/analytics/stats")
def analytics_stats():
    traces_response = langfuse.api.trace.list(limit=100)
    traces = traces_response.data

    total_questions = len(traces)
    latencies = [t.latency for t in traces if t.latency is not None]
    avg_latency = round(sum(latencies) / len(latencies), 2) if latencies else 0

    # Real question text per trace, falling back to the function name if unavailable
    recent = []
    question_counts = defaultdict(int)
    for t in traces:
        q_text = extract_question_text(t.input)
        display_text = q_text if q_text else f"Question asked: {t.name or 'unknown'}"
        if q_text:
            question_counts[q_text] += 1
        if len(recent) < 5:
            recent.append({"text": display_text, "time": str(t.timestamp)})

    # Top questions by real frequency
    top_questions = [
        {"question": q, "count": c}
        for q, c in sorted(question_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    # Group traces by day for the chart
    day_counts = defaultdict(int)
    for t in traces:
        if t.timestamp:
            day_key = t.timestamp.strftime("%Y-%m-%d") if isinstance(t.timestamp, datetime) else str(t.timestamp)[:10]
            day_counts[day_key] += 1

    # Sort by date, last 7 days worth
    sorted_days = sorted(day_counts.items())[-7:]
    questions_per_day = [{"day": day, "count": count} for day, count in sorted_days]

    return {
        "total_questions": total_questions,
        "avg_latency": avg_latency,
        "recent_activity": recent,
        "questions_per_day": questions_per_day,
        "top_questions": top_questions,
    }