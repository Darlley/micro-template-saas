'use server';

import { prisma } from '@/services/database';

export async function getUserWithId(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      Subscriptions: {
        select: {
          id: true,
          stripeId: true,
          interval: true,
          status: true,
          currentPeriodEnd: true,
          currentPeriodStart: true,
          price: {
            select: {
              id: true,
              stripePriceId: true,
              amount: true,
              interval: true,
              currency: true,
              metadata: true,
              product: {
                select: {
                  id: true,
                  stripeId: true,
                  name: true,
                  description: true,
                  active: true,
                  marketing_features: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
      },
    },
  });
  return user;
}
