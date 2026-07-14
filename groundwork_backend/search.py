from embeddings import embed_text
from rank_bm25 import BM25Okapi
from reranker import rerank
from vector_store import get_chunk_texts, query_vectors
from langfuse import observe
from dotenv import load_dotenv
load_dotenv()

def reciprocal_rank_fusion(vector_results, keyword_results, k=60):
    scores = {}
    for rank, chunk_id in enumerate(vector_results):
        scores[chunk_id] = scores.get(chunk_id, 0) + 1 / (k + rank + 1)
    for rank, chunk_id in enumerate(keyword_results):
        scores[chunk_id] = scores.get(chunk_id, 0) + 1 / (k + rank + 1)
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_scores

def vector_search(query_text, top_k=25, sources=None):
    query_embedding = embed_text(query_text)
    return query_vectors(query_embedding, top_k=top_k, sources=sources)

def keyword_search(query_text, bm25, ids, top_k=25):
    scores = bm25.get_scores(query_text.split())
    pairs = list(zip(ids, scores))
    sorted_pairs = sorted(pairs, key=lambda x: x[1], reverse=True)
    top_pairs = sorted_pairs[:top_k]
    return [pair[0] for pair in top_pairs]

def build_bm25_index(all_chunks_text):
    tokenized = [text.split() for text in all_chunks_text]
    return BM25Okapi(tokenized)

def hybrid_search(query_text, bm25, ids, top_k=25, sources=None):
    vector_results = vector_search(query_text, top_k=top_k, sources=sources)
    keyword_results = keyword_search(query_text, bm25, ids, top_k)
    return reciprocal_rank_fusion(vector_results, keyword_results)

@observe()
def search_and_rerank(query_text, bm25, ids, top_k=5, sources=None):
    search_results = hybrid_search(query_text, bm25, ids, sources=sources)
    pulled_ids = [chunk_id for chunk_id, score in search_results]
    chunks_text = get_chunk_texts(pulled_ids)
    return rerank(query_text, chunks_text, top_k)