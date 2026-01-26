import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/get-or-create-user';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Update the assessment with step1 data
    const assessment = await prisma.assessment.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        step1Data: body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error saving step 1:', error);
    return NextResponse.json(
      { error: 'Failed to save step 1 data' },
      { status: 500 }
    );
  }
}
