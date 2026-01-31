@echo off
echo Starting RAG API and Next.js services...

:: Start RAG API in background
echo Starting RAG API on port 8000...
start "RAG API" cmd /k "python rag_api.py"

:: Wait a moment for RAG API to start
timeout /t 3 /nobreak > nul

:: Start Next.js development server
echo Starting Next.js on port 3000...
start "Next.js" cmd /k "npm run dev"

echo Both services are starting...
echo RAG API: http://localhost:8000
echo Next.js: http://localhost:3000
pause