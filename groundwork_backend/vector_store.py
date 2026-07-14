import os
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchAny
from dotenv import load_dotenv
load_dotenv()

QDRANT_URL = os.environ.get("QDRANT_URL")
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY")
COLLECTION_NAME = "groundwork_chunks"
VECTOR_SIZE = 384

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

existing = [c.name for c in client.get_collections().collections]
if COLLECTION_NAME not in existing:
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )

from qdrant_client.models import PayloadSchemaType
client.create_payload_index(
    collection_name=COLLECTION_NAME,
    field_name="source",
    field_schema=PayloadSchemaType.KEYWORD,
)

client.create_payload_index(
    collection_name=COLLECTION_NAME,
    field_name="chunk_id",
    field_schema=PayloadSchemaType.KEYWORD,
)

def _point_id(chunk_id):
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk_id))

def store_records(records):
    points = [
        PointStruct(
            id=_point_id(r["id"]),
            vector=r["embedding"],
            payload={
                "chunk_id": r["id"],
                "text": r["text"],
                "parent_id": r["parent_id"],
                "source": r.get("source", "unknown"),
            }
        )
        for r in records
    ]
    client.upsert(collection_name=COLLECTION_NAME, points=points)

def get_all_chunks():
    ids, texts = [], []
    next_offset = None
    while True:
        records, next_offset = client.scroll(
            collection_name=COLLECTION_NAME, limit=256, offset=next_offset, with_payload=True
        )
        for rec in records:
            ids.append(rec.payload["chunk_id"])
            texts.append(rec.payload["text"])
        if next_offset is None:
            break
    return {"ids": ids, "documents": texts}

def get_chunks_by_sources(sources):
    ids, texts = [], []
    next_offset = None
    query_filter = Filter(must=[FieldCondition(key="source", match=MatchAny(any=sources))])
    while True:
        records, next_offset = client.scroll(
            collection_name=COLLECTION_NAME, scroll_filter=query_filter,
            limit=256, offset=next_offset, with_payload=True
        )
        for rec in records:
            ids.append(rec.payload["chunk_id"])
            texts.append(rec.payload["text"])
        if next_offset is None:
            break
    return {"ids": ids, "documents": texts}

def query_vectors(query_embedding, top_k=25, sources=None):
    query_filter = None
    if sources:
        query_filter = Filter(must=[FieldCondition(key="source", match=MatchAny(any=sources))])
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=top_k,
        query_filter=query_filter,
        with_payload=True,
    )
    return [r.payload["chunk_id"] for r in results.points]

def get_chunk_texts(chunk_ids):
    if not chunk_ids:
        return []
    query_filter = Filter(must=[FieldCondition(key="chunk_id", match=MatchAny(any=chunk_ids))])
    records, _ = client.scroll(
        collection_name=COLLECTION_NAME, scroll_filter=query_filter,
        limit=len(chunk_ids), with_payload=True
    )
    by_id = {rec.payload["chunk_id"]: rec.payload["text"] for rec in records}
    return [(cid, by_id[cid]) for cid in chunk_ids if cid in by_id]

def get_documents():
    counts = {}
    next_offset = None
    while True:
        records, next_offset = client.scroll(
            collection_name=COLLECTION_NAME, limit=256, offset=next_offset, with_payload=True
        )
        for rec in records:
            src = rec.payload.get("source", "unknown")
            counts[src] = counts.get(src, 0) + 1
        if next_offset is None:
            break
    return [{"source": src, "chunk_count": c} for src, c in counts.items()]