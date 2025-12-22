import chromadb
from sentence_transformers import SentenceTransformer
import uuid
import requests

client = chromadb.PersistentClient(path="./memora_db")

model = SentenceTransformer("all-MiniLM-L6-v2")

collection = client.get_or_create_collection(name="memora_memory")


def save_memory(texts):
    memory_id = str(uuid.uuid4())
    emb = model.encode([texts]).tolist()
    collection.add(
        documents=[texts],
        embeddings=emb,
        ids=[memory_id],
    )


def recall_memory(user_query, n_results=2):
    query_emb = model.encode([user_query]).tolist()
    results = collection.query(
        query_embeddings=query_emb,
        n_results=n_results,
        include=["documents", "embeddings", "metadatas"],
    )

    if results["documents"]:
        print("Relevant memory found")
        for doc in results["documents"]:
            print("-", doc)
    else:
        print("No relevant memory found")

    return results


def inference(prompt):
    # Use local DeepSeek model via Ollama
    r = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "deepseek-r1:7b", "prompt": prompt, "stream": False},
        timeout=120,
    )
    r.raise_for_status()
    data = r.json()
    text = data.get("response", "")

    import re

    clean_response = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    print(clean_response)
    return clean_response


def generate_response(user_query):
    # Step 1: Recall relevant memories from ChromaDB
    results = recall_memory(user_query)
    related_docs = results.get("documents", [[]])[0] if results.get("documents") else []

    save_memory(user_query)

    prompt = f"""You are a helpful AI assistant that remembers the user's past queries. 
Relevant memories: {related_docs} Use these relevant memories to answer the user question below.

Answer the user's query concisely and directly, without explaining or commenting on the memories. 

Do NOT include any internal reasoning, <think> tags, or step-by-step thoughts. 
Do not explain or comment on the memories. Keep the response short, clear, and actionable.

User query: {user_query}
Answer:
"""

    answer = inference(prompt)
    print(answer)
    return answer


if __name__ == "__main__":
    user_query = input("Enter your query: ")
    recall_memory(user_query)
    save_memory(user_query)
    print("User query saved to memory.")

    results = collection.get(include=["documents", "embeddings", "metadatas"])
    print("Collection count:", collection.count())

    response = generate_response(user_query)
    print("Final Response:", response)

