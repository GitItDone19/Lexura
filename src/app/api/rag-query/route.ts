import { NextRequest, NextResponse } from 'next/server';

interface RAGQueryRequest {
  question: string;
}

interface RAGQueryResponse {
  answer: string;
  citation: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: RAGQueryRequest = await request.json();
    
    if (!body.question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Call your RAG API
    const ragResponse = await fetch('http://localhost:8000/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: body.question }),
    });

    if (!ragResponse.ok) {
      throw new Error(`RAG API error: ${ragResponse.status}`);
    }

    const ragData: RAGQueryResponse = await ragResponse.json();

    return NextResponse.json(ragData);
  } catch (error) {
    console.error('Error querying RAG system:', error);
    return NextResponse.json(
      { 
        error: 'Failed to query RAG system', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}