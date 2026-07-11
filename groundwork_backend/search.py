from embeddings import embedder
from rank_bm25 import BM25Okapi
def reciprocal_rank_fusion(vector_results, keyword_results, k=60):
    """
    vector_results: list of chunk ids, in order (best match first)
    keyword_results: list of chunk ids, in order (best match first)
    Returns: list of (chunk_id, score) sorted by score, highest first
    """
    id={}
    scores = {}
    
    for rank, chunk_id in enumerate(vector_results):
        scores[chunk_id] = scores.get(chunk_id, 0) + 1/ (k + rank + 1)
       
    for rank, chunk_id in enumerate(keyword_results):
        scores[chunk_id] = scores.get(chunk_id, 0) + 1/ (k + rank + 1)   
        
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_scores

def vector_search(query_text, collection, top_k=25):
    """
    query_text: the user's search query
    collection: your ChromaDB collection object
    Returns: list of chunk ids, best vector match first
    """
    query_embedding = embedder.encode(query_text).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    return results['ids'][0] 

def keyword_search(query_text, bm25, ids, top_k=25):
    """
    Returns: list of chunk ids, best keyword match first
    """
    scores = bm25.get_scores(query_text.split())
    pairs = list(zip(ids, scores))
    sorted_pairs = sorted(pairs, key=lambda x: x[1], reverse=True)
    top_pairs = sorted_pairs[:top_k]
    top_ids = [pair[0] for pair in top_pairs]
    return top_ids

def build_bm25_index(all_chunks_text):
    """
    all_chunks_text: list of chunk text strings, in the same order as your ids list
    Returns: a BM25Okapi object ready to use in keyword_search
    """
    tokenized = [text.split() for text in all_chunks_text]
    return BM25Okapi(tokenized)

def hybrid_search(query_text, collection, bm25, ids, top_k=25):
    """
    Runs vector search + keyword search, then fuses them with RRF.
    Returns: list of (chunk_id, score) sorted by score, highest first
    """
    vector_results = vector_search(query_text, collection, top_k)
    keyword_results = keyword_search(query_text, bm25, ids, top_k)
    fused_results = reciprocal_rank_fusion(vector_results, keyword_results)
    return fused_results

class FakeBM25:
    def get_scores(self,query_words):
        return [0.5, 0.9, 0.1]

if __name__ == "__main__":
    print(keyword_search("test", FakeBM25(), ["A","B","C"]))
    print(reciprocal_rank_fusion(["A","B","C"], ["B","A","C"]))