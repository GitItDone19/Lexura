import os
import itertools
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from sentence_transformers import SentenceTransformer, CrossEncoder
import chromadb
from dotenv import load_dotenv

# --- SETUP & CONFIG ---
load_dotenv()
DB_PATH = "./eu_ai_act_index"  # Updated to use relative path in your workspace
COLLECTION_NAME = "eu_ai_act"
EMBED_MODEL = "all-MiniLM-L6-v2"
RERANK_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"
GEMINI_MODEL = "gemini-2.5-flash"

# Key Rotation Setup
keys_str = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEYS")
if not keys_str:
    raise RuntimeError("No GEMINI_API_KEY found.")
api_keys = [k.strip() for k in keys_str.split(",") if k.strip()]
key_cycle = itertools.cycle(api_keys)

# --- MODELS STATE ---
# We store models in a dictionary so they are accessible globally after startup
models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown of heavy models."""
    print("🚀 Loading ChromaDB and Local Models...")
    try:
        chroma_client = chromadb.PersistentClient(path=DB_PATH)
        models["collection"] = chroma_client.get_collection(name=COLLECTION_NAME)
        models["embedder"] = SentenceTransformer(EMBED_MODEL)
        models["reranker"] = CrossEncoder(RERANK_MODEL)
        print("✅ Models loaded and ready.")
    except Exception as e:
        print(f"⚠️ Warning: Could not load ChromaDB collection: {e}")
        print("   RAG will use fallback mode (Gemini only)")
        models["collection"] = None
        models["embedder"] = None
        models["reranker"] = None
    yield
    models.clear()

app = FastAPI(lifespan=lifespan)

# --- CORS FOR NEXT.JS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Your Next.js URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    citation: str | None = None

# --- API ENDPOINT ---
@app.post("/query", response_model=QueryResponse)
async def ask_legal_rag(request: QueryRequest):
    try:
        user_question = request.question
        
        # 1. Rotate Key & Client
        api_key = next(key_cycle)
        client = genai.Client(api_key=api_key)
        
        # Check if ChromaDB is available
        if not models["collection"]:
            # Fallback to direct Gemini query
            print("⚠️ ChromaDB not available, using Gemini fallback")
            prompt = f"""You are a strict legal assistant for the EU AI Act.
            
            Please provide a comprehensive answer about the EU AI Act for the following question:
            {user_question}
            
            Include relevant article references where possible and provide practical guidance."""
            
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=1024)
            )
            
            return QueryResponse(
                answer=f"[FALLBACK MODE] {response.text}",
                citation="EU AI Act (General Knowledge)"
            )
        
        # 2. Vector Retrieval (original code)
        q_emb = models["embedder"].encode([user_question]).tolist()
        results = models["collection"].query(query_embeddings=q_emb, n_results=20)

        if not results["documents"] or not results["documents"][0]:
            return QueryResponse(answer="No relevant legal data found.")

        # 3. Preparation & Reranking
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

        pairs = [[user_question, c["full_context"]] for c in candidates]
        scores = models["reranker"].predict(pairs)

        for i, c in enumerate(candidates):
            score = scores[i]
            if c["phase"] == "Articles": score += 2.0
            if "Definitions" in c["breadcrumbs"] and "defined" in user_question.lower(): score += 1.5
            c["score"] = score

        ranked = sorted(candidates, key=lambda x: x["score"], reverse=True)

        # 4. Context Building
        final_context = []
        seen_base = set()
        for c in ranked:
            base = c["citation"].split("(")[0]
            if base not in seen_base:
                final_context.append(c)
                seen_base.add(base)
            if len(final_context) == 5: break

        context_str = "\n\n".join([
            f"SOURCE [{c['citation']}] Page {c['page']}\nPATH: {c['breadcrumbs']}\nTEXT: {c['text']}"
            for c in final_context
        ])

        # 5. Gemini Generation
        prompt = f"""You are a strict legal assistant for the EU AI Act.
        INSTRUCTIONS:
        1. Answer using ONLY the sources below.
        2. Cite every claim clearly, e.g., [Art. X(y), p. Z].
        3. If the answer is not in the sources, state clearly that you cannot find it.

        SOURCES:
        {context_str}

        QUESTION:
        {user_question}"""

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=1024)
        )

        return QueryResponse(
            answer=response.text,
            citation=ranked[0]["citation"] if ranked else None
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)