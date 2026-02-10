import chromadb

print("Testing ChromaDB connection...")
client = chromadb.PersistentClient(path="./eu_ai_act_index")
print(f"Client created successfully")

collections = client.list_collections()
print(f"Found {len(collections)} collections:")
for col in collections:
    print(f"  - {col.name}: {col.count()} documents")

if collections:
    collection = client.get_collection("eu_ai_act")
    print(f"\n✅ Successfully loaded collection: {collection.name}")
    print(f"   Document count: {collection.count()}")
