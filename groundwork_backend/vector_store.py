import chromadb

client = chromadb.PersistentClient(path="./chroma_data")
collection = client.get_or_create_collection("groundwork_chunks")

def store_records(records):
    collection.add(
        ids=[r["id"] for r in records],
        embeddings=[r["embedding"] for r in records],
        documents=[r["text"] for r in records],
        metadatas=[{"parent_id": r["parent_id"], "source": r.get("source", "unknown")} for r in records]
    )

def get_chunk_texts(chunk_ids):
    chunk_data = collection.get(ids=chunk_ids)
    paired_results = list(zip(chunk_data['ids'], chunk_data['documents']))
    return paired_results

def get_documents():
    """
    Returns a list of unique source documents currently indexed, with chunk counts.
    """
    all_data = collection.get()
    counts = {}
    for meta in all_data['metadatas']:
        src = meta.get('source', 'unknown')
        counts[src] = counts.get(src, 0) + 1
    return [{"source": src, "chunk_count": c} for src, c in counts.items()]