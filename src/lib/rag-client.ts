interface RAGQueryResponse {
  answer: string;
  citation: string | null;
}

export class RAGClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/rag-query') {
    this.baseUrl = baseUrl;
  }

  async query(question: string): Promise<RAGQueryResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`RAG query failed: ${response.status}`);
    }

    return response.json();
  }

  async queryWithFallback(question: string, fallbackFn?: () => Promise<string>): Promise<{
    answer: string;
    citation: string | null;
    source: 'rag' | 'fallback';
  }> {
    try {
      const ragResponse = await this.query(question);
      return {
        ...ragResponse,
        source: 'rag'
      };
    } catch (error) {
      console.warn('RAG query failed, using fallback:', error);
      
      if (fallbackFn) {
        const fallbackAnswer = await fallbackFn();
        return {
          answer: fallbackAnswer,
          citation: null,
          source: 'fallback'
        };
      }
      
      throw error;
    }
  }
}

export const ragClient = new RAGClient();