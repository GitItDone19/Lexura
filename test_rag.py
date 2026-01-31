import os
from pathlib import Path

print("🔍 Testing RAG Components...")

# Check if ChromaDB index exists
db_path = Path("./eu_ai_act_index")
if db_path.exists():
    print(f"✅ ChromaDB index found at: {db_path}")
    contents = list(db_path.iterdir())
    print(f"   Contents: {[f.name for f in contents]}")
else:
    print(f"❌ ChromaDB index not found at: {db_path}")

# Check environment variables
print("\n🔑 Checking Environment Variables...")
from dotenv import load_dotenv
load_dotenv()

gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEYS")
if gemini_key:
    print("✅ GEMINI_API_KEY found")
else:
    print("❌ GEMINI_API_KEY not found")

print("\nRAG system ready to test!")