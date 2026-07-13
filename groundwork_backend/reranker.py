import os
import cohere
from dotenv import load_dotenv
load_dotenv()

co = cohere.Client(os.environ.get("COHERE_API_KEY"))

def rerank(query_text, candidates, top_k=5):
    """
    query_text: the user's search query (string)
    candidates: list of (chunk_id, chunk_text) tuples — the shortlist from hybrid_search
    Returns: list of (chunk_id, score) sorted by relevance, highest first, top_k only
    """
    chunk_ids = [chunk_id for chunk_id, _ in candidates]
    chunk_texts = [chunk_text for _, chunk_text in candidates]

    response = co.rerank(
        model="rerank-v3.5",
        query=query_text,
        documents=chunk_texts,
        top_n=top_k,
    )

    results = [(chunk_ids[result.index], result.relevance_score) for result in response.results]
    return results


if __name__ == "__main__":
    fake_candidates = [
        ("A", "The cat sat on the mat"),
        ("B", "Python is a programming language"),
        ("C", "Cats are small furry animals")
    ]
    result = rerank("Tell me about cats", fake_candidates, top_k=2)
    print(result)