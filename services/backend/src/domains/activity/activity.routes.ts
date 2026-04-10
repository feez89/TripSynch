import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import { requireTripMember } from '../../middleware/auth.middleware';

export async function activityRoutes(fastify: FastifyInstance) {
  fastify.get('/:tripId/activity', { preHandler: requireTripMember }, async (req) => {
    const { tripId } = req.params as { tripId: string };
    const { limit = '30', offset = '0' } = req.query as { limit?: string; offset?: string };

    return prisma.activityEvent.findMany({
      where: { tripId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(limit), 100),
      skip: parseInt(offset),
    });
  });
}
