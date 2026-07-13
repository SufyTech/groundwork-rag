import os
import requests
from chunking import chunk_document
from dotenv import load_dotenv
load_dotenv()

HF_TOKEN = os.environ.get("HF_TOKEN")
API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"
print("Token loaded:", HF_TOKEN[:5] if HF_TOKEN else "NOTHING FOUND")

def embed_text(text: str):
    response = requests.post(
        API_URL,
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={"inputs": text, "options": {"wait_for_model": True}},
    )
    return response.json()


def embed_chunks(parent_chunks, source="unknown"):
    records = []

    for parent in parent_chunks:
        for child in parent["children"]:
            vector = embed_text(child["child_text"])
            records.append({
                "id": child["child_id"],
                "embedding": vector,
                "text": child["child_text"],
                "parent_id": child["parent_id"],
                "source": source
            })

    return records

if __name__ == "__main__":
    chunks = chunk_document("a" * 4000)
    records = embed_chunks(chunks)
    print("Total records:", len(records))
    print(records[0])