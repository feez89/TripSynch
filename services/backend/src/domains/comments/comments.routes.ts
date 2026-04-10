import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import { createCommentSchema } from './comments.schema';
import { requireAuth } from '../../middleware/auth.middleware';

export async function commentRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preHandler: requireAuth }, async (req, reply) => {
    const userId = (req as any).authUser.id;
    const body = createCommentSchema.parse(req.body);

    // Verify user is trip member
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId: body.tripId, userId } },
    });
    if (!member) return reply.status(403).send({ error: 'Not a trip member' });

    const comment = await prisma.comment.create({
      data: {
        userId,
        targetType: body.targetType,
        targetId: body.targetId,
        body: body.body,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await prisma.activityEvent.create({
      data: {
        tripId: body.tripId,
        userId,
        type: 'COMMENT_ADDED',
        payload: { targetType: body.targetType, targetId: body.targetId },
      },
    });

    return reply.status(201).send(comment);
  });
}
