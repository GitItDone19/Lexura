# ============================================================
# RAG APP - FULL SCRIPT WITH PER-QUERY GEMINI KEY ROTATION
# ============================================================

import os
import itertools
import random
import chromadb
from google import genai
from google.genai import types
from sentence_transformers import SentenceTransformer, CrossEncoder
from dotenv import load_dotenv

# -------------------------------
# LOAD ENV VARIABLES
# -------------------------------
load_dotenv()

# We check both possible names for your env variable
keys_str = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEYS")
if not keys_str:
    raise RuntimeError("No GEMINI_API_KEY found in environment. Check your .env file.")

# Split into a list and create a cycle for rotation
api_keys = [k.strip() for k in keys_str.split(",") if k.strip()]
key_cycle = itertools.cycle(api_keys)

# -------------------------------
# CONFIG
# -------------------------------
DB_PATH = "./eu_ai_act_index"  # Use local database
COLLECTION_NAME = "eu_ai_act"

EMBED_MODEL = "all-MiniLM-L6-v2"
RERANK_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"
GEMINI_MODEL = "gemini-2.5-flash"

# -------------------------------
# LOAD CHROMA DATABASE
# -------------------------------
print("Loading ChromaDB...")
chroma_client = chromadb.PersistentClient(path=DB_PATH)
collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)

print(f"Documents in collection: {collection.count()}")

# -------------------------------
# LOAD EMBEDDING AND RERANKER MODELS
# -------------------------------
print("Loading local models (this may take a minute)...")
embedder = SentenceTransformer(EMBED_MODEL)
reranker = CrossEncoder(RERANK_MODEL)

# -------------------------------
# LEGAL RAG CLASS
# -------------------------------
class LegalRAG:
    def __init__(self, collection, reranker, embedder, gemini_model_name):
        self.collection = collection
        self.reranker = reranker
        self.embedder = embedder
        self.gemini_model_name = gemini_model_name
        
        # Define generation config once (temperature 0 for legal accuracy)
        self.gen_config = types.GenerateContentConfig(
            temperature=0.0,
            top_p=0.95,
            max_output_tokens=1024
        )

    def query(self, user_question):
        # 1. ROTATE API KEY & INITIALIZE NEW CLIENT
        api_key = next(key_cycle)
        client = genai.Client(api_key=api_key)
        
        print(f"\n[KEY ROTATION] Using key: {api_key[:6]}...")
        print(f"QUERY: {user_question}")

        # 2. VECTOR RETRIEVAL
        q_emb = self.embedder.encode([user_question]).tolist() # Chroma needs list
        results = self.collection.query(
            query_embeddings=q_emb,
            n_results=20  # Retrieval limit; reranker handles the rest
        )

        if not results["documents"] or not results["documents"][0]:
            return "No relevant legal data found."

        # 3. CANDIDATE PREPARATION
        candidates = []
        for i, doc in enumerate(results["documents"][0]):
            meta = results["metadatas"][0][i]
            candidates.append({
                "text": doc,
                "citation": meta.get("citation", "Unknown"),
                "breadcrumbs": meta.get("breadcrumbs", ""),
                "phase": meta.get("phase", ""),
                "page": meta.get("page", "?"),
                "full_context": f"METADATA: {meta.get('breadcrumbs','')}\nCONTENT: {doc}"
            })

        # 4. RERANKING
        pairs = [[user_question, c["full_context"]] for c in candidates]
        scores = self.reranker.predict(pairs)

        for i, c in enumerate(candidates):
            score = scores[i]
            # Boost logic
            if c["phase"] == "Articles":
                score += 2.0
            if "Definitions" in c["breadcrumbs"] and "defined" in user_question.lower():
                score += 1.5
            c["score"] = score

        ranked = sorted(candidates, key=lambda x: x["score"], reverse=True)

        # 5. DIVERSITY FILTERING (Top 5 unique citations)
        final_context = []
        seen_base = set()
        for c in ranked:
            base = c["citation"].split("(")[0]
            if base not in seen_base:
                final_context.append(c)
                seen_base.add(base)
            if len(final_context) == 5:
                break

        print(f"Top match found: {final_context[0]['citation']}")

        # 6. GENERATION
        context_str = "\n\n".join([
            f"SOURCE [{c['citation']}] Page {c['page']}\nPATH: {c['breadcrumbs']}\nTEXT: {c['text']}"
            for c in final_context
        ])

        prompt = f"""
You are a strict legal assistant for the EU AI Act.

INSTRUCTIONS:
1. Answer using ONLY the sources below.
2. Cite every claim clearly, e.g., [Art. X(y), p. Z].
3. If the answer is not in the sources, state clearly that you cannot find it.

SOURCES:
{context_str}

QUESTION:
{user_question}
"""

        # Using the new SDK syntax: client.models.generate_content
        response = client.models.generate_content(
            model=self.gemini_model_name,
            contents=prompt,
            config=self.gen_config
        )

        return response.text

# -------------------------------
# EXECUTION
# -------------------------------
if __name__ == "__main__":
    rag = LegalRAG(
        collection=collection,
        reranker=reranker,
        embedder=embedder,
        gemini_model_name=GEMINI_MODEL
    )

    # Test Queries
    print(rag.query("What biometric systems are prohibited?"))
    print(rag.query("What is a high-risk AI system?"))