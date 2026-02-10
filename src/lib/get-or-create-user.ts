import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export async function getOrCreateUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0].emailAddress;

  // Try to find existing user by clerkId first
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  // If not found by clerkId, try by email
  if (!user) {
    user = await prisma.user.findUnique({
      where: { email },
    });

    // If found by email, update the clerkId
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          clerkId: clerkUser.id,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || user.name,
          avatar: clerkUser.imageUrl || user.avatar,
        },
      });
    }
  }

  // If user still doesn't exist, create them
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        avatar: clerkUser.imageUrl || null,
        role: 'CLIENT',
      },
    });
  }

  return user;
}
