import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/get-or-create-user';
import { generateBriefSummary } from '../../../lib/generate-brief-summary';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ragClient } from '@/lib/rag-client';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentData } = body;

    if (!assessmentData) {
      return NextResponse.json({ error: 'Assessment data required' }, { status: 400 });
    }

    // Generate a brief summary sentence instead of long prompt
    const briefSummary = generateBriefSummary(assessmentData);

    // Log the summary to console for debugging
    console.log('\n=== GENERATED SUMMARY FOR RAG ===');
    console.log(briefSummary);
    console.log('=== END SUMMARY ===\n');

    // Query RAG system with fallback to Gemini
    const ragResponse = await ragClient.queryWithFallback(
      briefSummary,
      async () => {
        // Fallback to Gemini if RAG fails
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-pro',
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            maxOutputTokens: 8000,
          },
        });

        const systemPrompt = 'You are an expert EU AI Act compliance consultant. Provide detailed, accurate, and actionable compliance reports based on the EU AI Act regulations. Always reference specific articles and provide practical guidance.';
        
        const result = await model.generateContent(`${systemPrompt}\n\n${briefSummary}`);
        const response = await result.response;
        return response.text();
      }
    );

    return NextResponse.json({
      report: ragResponse.answer,
      summary: briefSummary,
      citation: ragResponse.citation,
      source: ragResponse.source, // 'rag' or 'fallback'
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
