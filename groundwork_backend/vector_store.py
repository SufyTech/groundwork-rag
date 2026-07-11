import chromadb

client = chromadb.PersistentClient(path="./chroma_data")
collection = client.get_or_create_collection("groundwork_chunks")

def store_records(records):
    collection.add(
        ids=[r["id"] for r in records],
        embeddings=[r["embedding"] for r in records],
        documents=[r["text"] for r in records],
        metadatas=[{"parent_id": r["parent_id"]} for r in records]
    )
    