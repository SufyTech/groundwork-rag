from sentence_transformers import CrossEncoder

reranker_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def rerank(query_text, candidates, top_k=5):
    """
    query_text: the user's search query (string)
    candidates: list of (chunk_id, chunk_text) tuples — the shortlist from hybrid_search
    Returns: list of (chunk_id, score) sorted by relevance, highest first, top_k only
    """
    candidate_pairs = [[query_text, chunk_text] for chunk_id, chunk_text in candidates]
    scores = reranker_model.predict(candidate_pairs)
    zipped_results = list(zip([chunk_id for chunk_id, _ in candidates], scores))
    sorted_results = sorted(zipped_results, key=lambda x: x[1], reverse=True)
    sorted_results = sorted_results[:top_k]
    return sorted_results
   
if __name__ == "__main__":
    fake_candidates = [
        ("A", "The cat sat on the mat"),
        ("B", "Python is a programming language"),
        ("C", "Cats are small furry animals")
    ]
    result = rerank("Tell me about cats", fake_candidates, top_k=2)
    print(result)