import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/get-or-create-user';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get assessment statistics
    const [totalAssessments, inProgress, completed, assessments] = await Promise.all([
      prisma.assessment.count({
        where: { userId: user.id },
      }),
      prisma.assessment.count({
        where: {
          userId: user.id,
          status: 'IN_PROGRESS',
        },
      }),
      prisma.assessment.count({
        where: {
          userId: user.id,
          status: 'COMPLETED',
        },
      }),
      prisma.assessment.findMany({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          overallScore: { not: null },
        },
        select: {
          overallScore: true,
        },
      }),
    ]);

    // Calculate average compliance score
    const avgScore = assessments.length > 0
      ? assessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / assessments.length
      : 0;

    return NextResponse.json({
      totalAssessments,
      inProgress,
      completed,
      avgScore: Math.round(avgScore * 10) / 10,
      userRole: user.role,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
