from chunking import chunk_document
from sentence_transformers import SentenceTransformer
embedder = SentenceTransformer('all-MiniLM-L6-v2')

def embed_text(text: str):
    return embedder.encode(text).tolist()


def embed_chunks(parent_chunks):
    records = []              # blank 1: same idea as chunks/children before — starts as what?

    for parent in parent_chunks:
        for child in parent["children"]:
            vector = embed_text(child["child_text"])   # blank 2: which function turns text into numbers?
            records.append({                        # blank 3: how do you add to a list?
                "id": child["child_id"],
                "embedding": vector,
                "text": child["child_text"],
                "parent_id": child["parent_id"]
            })

    return records

if __name__ == "__main__":
    chunks = chunk_document("a" * 4000)
    records = embed_chunks(chunks)
    print("Total records:", len(records))
    print(records[0])