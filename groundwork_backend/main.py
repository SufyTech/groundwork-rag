from fastapi import FastAPI
from vector_store import collection, get_chunk_texts
from search import build_bm25_index, search_and_rerank
from generator import generate_answer

app = FastAPI()

# Build the bm25 index once, when the server starts (not on every request)
all_data = collection.get()
all_ids = all_data['ids']
all_texts = all_data['documents']
bm25 = build_bm25_index(all_texts)

@app.get("/ask")
def ask(question: str):
    reranked = search_and_rerank(question, collection, bm25, all_ids)
    answer = generate_answer(question, reranked)
    return {"question": question, "answer": answer}