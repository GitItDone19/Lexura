import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/get-or-create-user';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent assessments
    const assessments = await prisma.assessment.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        overallScore: true,
        updatedAt: true,
        step1Data: true,
        step2Data: true,
        step3Data: true,
      },
    });

    // Format the response
    const formattedAssessments = assessments.map((assessment) => {
      const step1Data = assessment.step1Data as any;
      
      // Calculate progress
      const step1Completed = assessment.step1Data !== null;
      const step2Completed = assessment.step2Data !== null;
      const step3Completed = assessment.step3Data !== null;
      const completedSteps = [step1Completed, step2Completed, step3Completed].filter(Boolean).length;
      const progress = Math.round((completedSteps / 3) * 100);
      
      return {
        id: assessment.id,
        name: step1Data?.systemName || 'Untitled Assessment',
        status: assessment.status,
        score: assessment.overallScore,
        updatedAt: assessment.updatedAt.toISOString(),
        progress,
      };
    });

    return NextResponse.json(formattedAssessments);
  } catch (error) {
    console.error('Recent assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent assessments' },
      { status: 500 }
    );
  }
}
