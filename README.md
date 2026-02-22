# ⚖️ Lexura

Lexura is a comprehensive platform designed to help organizations assess and ensure their AI systems comply with the **EU AI Act**. It features an interactive assessment flow, compliance report generation, and an automated legal assistant powered by Retrieval-Augmented Generation (RAG) using the official EU AI Act texts.

## 🚀 Features

- **AI System Assessment**: Streamlined interactive forms to classify AI systems according to the EU AI Act's risk categories.
- **Automated Compliance Reports**: Instantly generate actionable compliance gap analyses and reports using Google's Gemini 2.5 Flash.
- **RAG Legal Assistant**: A built-in chatbot that can answer specific legal queries strictly based on the EU AI Act legislation, powered by ChromaDB and Sentence Transformers.
- **User Dashboard**: Keep track of previous assessments and monitor compliance readiness over time.
- **Secure Authentication**: User management handled securely by Clerk.

## 🛠️ Tech Stack

**Frontend / Core Application:**
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS v4
- Database: PostgreSQL (Neon) with Prisma ORM
- Authentication: Clerk
- UI Components: Shadcn UI / Radix UI

**Python RAG Backend:**
- Framework: FastAPI
- Vector Database: ChromaDB
- Embeddings: Sentence Transformers (`all-MiniLM-L6-v2`)
- Re-ranking: Cross-Encoder (`ms-marco-MiniLM-L-6-v2`)
- LLM Provider: Google Gemini API

---

## 💻 Running the Project Locally

To run Lexura locally, you need to set up both the Next.js application and the Python RAG API.

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- PostgreSQL Database (e.g., Neon or local pg)
- A Google Gemini API Key

### 2. Environment Variables

Create a `.env` file in the root directory and add the necessary environment variables. (Refer to `.env.example` if available).

```env
# Next.js / Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database
DATABASE_URL="postgresql://user:password@host/db_name?sslmode=require"

# AI / Python API
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_RAG_API_URL=http://localhost:8000/query
```

### 3. Setup Next.js Application

1. Install dependencies:
   ```bash
   npm install
   ```
2. Push Prisma schema to your database:
   ```bash
   npx prisma db push
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
The frontend will be available at `http://localhost:3000`.

### 4. Setup Python RAG API

1. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure your ChromaDB index (`eu_ai_act_index`) is properly populated.
4. Start the FastAPI server (your script might be named `rag_api.py` or similar):
   ```bash
   python rag_api.py
   # OR
   uvicorn rag_api:app --reload
   ```
The RAG API will run on `http://localhost:8000`.

## 📜 License

This project is licensed under the MIT License.
