import chromadb
import sqlite3
import os

db_path = "./eu_ai_act_index"
print(f"📂 Checking: {db_path}")

# Check SQLite
sqlite_path = os.path.join(db_path, "chroma.sqlite3")
if os.path.exists(sqlite_path):
    print(f"\n📊 SQLite database found")
    conn = sqlite3.connect(sqlite_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]
    print(f"Tables: {tables}")
    
    for table in tables:
        if 'collection' in table.lower():
            print(f"\n📋 {table}:")
            cursor.execute(f"SELECT * FROM {table};")
            for row in cursor.fetchall():
                print(f"   {row}")
    
    conn.close()

# Check ChromaDB
try:
    client = chromadb.PersistentClient(path=db_path)
    collections = client.list_collections()
    print(f"\n🗂️ Collections: {len(collections)}")
    
    for col in collections:
        print(f"\n✅ Collection: '{col.name}'")
        print(f"   Count: {col.count()}")
        if col.count() > 0:
            sample = col.peek(limit=1)
            if sample['documents']:
                print(f"   Sample: {sample['documents'][0][:100]}...")
except Exception as e:
    print(f"❌ Error: {e}")
