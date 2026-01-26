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
      },
    });

    // Format the response
    const formattedAssessments = assessments.map((assessment) => {
      const step1Data = assessment.step1Data as any;
      return {
        id: assessment.id,
        name: step1Data?.systemName || 'Untitled Assessment',
        status: assessment.status,
        score: assessment.overallScore,
        updatedAt: assessment.updatedAt.toISOString(),
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
