from chunking import chunk_document
from embeddings import embed_chunks
from vector_store import store_records

# Some sample text to test with
sample_text = "The sun is a star at the center of our solar system. " * 100

# Step 1: chunk it
chunks = chunk_document(sample_text)
print("Chunks created:", len(chunks))

# Step 2: embed it
records = embed_chunks(chunks)
print("Records embedded:", len(records))

# Step 3: store it
store_records(records)
print("Stored in ChromaDB!")