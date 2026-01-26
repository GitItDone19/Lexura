import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/get-or-create-user';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a new assessment
    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id,
        status: 'IN_PROGRESS',
      },
    });

    return NextResponse.json({ id: assessment.id });
  } catch (error) {
    console.error('Create assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all assessments for the user
    const assessments = await prisma.assessment.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        status: true,
        overallScore: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
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
        createdAt: assessment.createdAt.toISOString(),
        updatedAt: assessment.updatedAt.toISOString(),
        completedAt: assessment.completedAt?.toISOString() || null,
      };
    });

    return NextResponse.json(formattedAssessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}
