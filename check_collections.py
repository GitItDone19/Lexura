import chromadb

# Connect to the database
client = chromadb.PersistentClient(path="./eu_ai_act_index")

# List all collections
collections = client.list_collections()
print("Available collections:")
for collection in collections:
    print(f"  - {collection.name}")
    print(f"    Count: {collection.count()}")