import os
from dotenv import load_dotenv
from vector_store import get_chunk_texts
from groq import Groq
from langfuse import Langfuse, observe

load_dotenv()
langfuse = Langfuse(
    public_key=os.environ.get("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.environ.get("LANGFUSE_SECRET_KEY"),
    host=os.environ.get("LANGFUSE_HOST")
)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@observe()
def generate_answer(query_text, reranked_results):
    """
    query_text: the user's question
    reranked_results: list of (chunk_id, score) — output straight from search_and_rerank()
    Returns: a string answer, grounded in the chunks, with citations like [1], [2]
    """
    
    chunk_ids = [chunk_id for chunk_id, score in reranked_results]
    chunk_texts = get_chunk_texts(chunk_ids)
    
    context_parts = []
    for i, (chunk_id, chunk_text) in enumerate(chunk_texts):
        context_parts.append(f"[{i+1}] {chunk_text}")
        
    context_str = "\n".join(context_parts)   
    
    prompt = f"""
You are a helpful assistant. Use the following context to answer the question below. Cite your sources using the format [1], [2], etc. If the context does not contain the answer, say "I don't know."

Context:
{context_str}

Question: {query_text}

Answer:"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    from search import build_bm25_index, search_and_rerank
    from vector_store import collection

    all_data = collection.get()
    all_ids = all_data['ids']
    all_texts = all_data['documents']
    bm25 = build_bm25_index(all_texts)

    reranked = search_and_rerank("Tell me about the sun", collection, bm25, all_ids)
    answer = generate_answer("Tell me about the sun", reranked)
    print(answer)