import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export async function getOrCreateUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  // If user doesn't exist, create them
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        avatar: clerkUser.imageUrl || null,
        role: 'CLIENT',
      },
    });
  }

  return user;
}
