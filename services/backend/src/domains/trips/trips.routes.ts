import { FastifyInstance } from 'fastify';
import { tripService } from './trips.service';
import { createTripSchema, joinTripSchema } from './trips.schema';
import { requireAuth, requireTripMember } from '../../middleware/auth.middleware';

export async function tripRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preHandler: requireAuth }, async (req, reply) => {
    const userId = (req as any).authUser.id;
    const body = createTripSchema.parse(req.body);
    const trip = await tripService.createTrip(userId, body);
    return reply.status(201).send(trip);
  });

  fastify.get('/', { preHandler: requireAuth }, async (req) => {
    const userId = (req as any).authUser.id;
    return tripService.getUserTrips(userId);
  });

  fastify.get('/:tripId', { preHandler: requireAuth }, async (req) => {
    const userId = (req as any).authUser.id;
    const { tripId } = req.params as { tripId: string };
    return tripService.getTripById(tripId, userId);
  });

  fastify.post('/:tripId/invite', { preHandler: requireTripMember }, async (req) => {
    const userId = (req as any).authUser.id;
    const { tripId } = req.params as { tripId: string };
    return tripService.generateInviteLink(tripId, userId);
  });

  fastify.post('/join', { preHandler: requireAuth }, async (req) => {
    const userId = (req as any).authUser.id;
    const { inviteCode } = joinTripSchema.parse(req.body);
    return tripService.joinTrip(inviteCode, userId);
  });
}
