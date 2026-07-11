import sys
import types

fake_module = types.ModuleType("langchain_community.chat_models.vertexai")
class ChatVertexAI:
    pass
fake_module.ChatVertexAI = ChatVertexAI
sys.modules["langchain_community.chat_models.vertexai"] = fake_module

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from langchain_community.embeddings import HuggingFaceEmbeddings

load_dotenv()

groq_llm = ChatGroq(
    api_key=os.environ.get("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile"
)

ragas_llm = LangchainLLMWrapper(groq_llm)
ragas_embeddings = LangchainEmbeddingsWrapper(HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2"))

from ragas import evaluate
from ragas.metrics import faithfulness, AnswerRelevancy
from datasets import Dataset

answer_relevancy_metric = AnswerRelevancy(strictness=1)

from generator import generate_answer
from search import build_bm25_index, search_and_rerank
from vector_store import collection

# Build bm25 index from real stored data
all_data = collection.get()
all_ids = all_data['ids']
all_texts = all_data['documents']
bm25 = build_bm25_index(all_texts)

# Run your real pipeline on one test question
question = "Tell me about the sun"
reranked = search_and_rerank(question, collection, bm25, all_ids)
answer = generate_answer(question, reranked)

# Get the actual retrieved chunk texts (needed for evaluation)
from vector_store import get_chunk_texts
chunk_ids = [chunk_id for chunk_id, score in reranked]
contexts = [text for chunk_id, text in get_chunk_texts(chunk_ids)]

# Build the dataset Ragas expects
eval_data = Dataset.from_dict({
    "question": [question],
    "answer": [answer],
    "contexts": [contexts]
})

# Run the evaluation
results = evaluate(
    eval_data,
    metrics=[faithfulness, answer_relevancy_metric],
    llm=ragas_llm,
    embeddings=ragas_embeddings
)
print(results)