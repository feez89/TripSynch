import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { UnauthorizedError } from '../lib/errors';

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
    const payload = req.user as { userId: string; email: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
    if (!user) throw new UnauthorizedError();
    (req as any).authUser = user;
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

export async function requireTripMember(req: FastifyRequest, reply: FastifyReply) {
  await requireAuth(req, reply);
  if (reply.sent) return;

  const tripId = (req.params as any).tripId;
  if (!tripId) return;

  const userId = (req as any).authUser?.id;
  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
  if (!member) {
    reply.status(403).send({ error: 'Not a member of this trip' });
  }
}
