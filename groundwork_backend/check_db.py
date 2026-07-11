from vector_store import collection

print("Total chunks stored:", collection.count())

# Peek at a few records
sample = collection.get(limit=3)
for i in range(len(sample['ids'])):
    print("\n--- Chunk", i+1, "---")
    print("ID:", sample['ids'][i])
    print("Text:", sample['documents'][i][:100])  # first 100 characters
    print("Metadata:", sample['metadatas'][i])