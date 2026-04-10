import { FastifyInstance } from 'fastify';
import { flightService } from './flights.service';
import { flightSearchSchema, saveFlightSchema, voteSchema } from './flights.schema';
import { requireTripMember } from '../../middleware/auth.middleware';

export async function flightRoutes(fastify: FastifyInstance) {
  fastify.get('/:tripId/flights/search', { preHandler: requireTripMember }, async (req) => {
    const params = flightSearchSchema.parse(req.query);
    const { tripId } = req.params as { tripId: string };
    return flightService.search(tripId, params);
  });

  fastify.get('/:tripId/flights/saved', { preHandler: requireTripMember }, async (req) => {
    const { tripId } = req.params as { tripId: string };
    return flightService.getSaved(tripId);
  });

  fastify.post('/:tripId/flights/save', { preHandler: requireTripMember }, async (req, reply) => {
    const userId = (req as any).authUser.id;
    const { tripId } = req.params as { tripId: string };
    const body = saveFlightSchema.parse(req.body);
    const saved = await flightService.saveFlight(tripId, userId, body);
    return reply.status(201).send(saved);
  });

  fastify.post('/:tripId/flights/:optionId/vote', { preHandler: requireTripMember }, async (req) => {
    const userId = (req as any).authUser.id;
    const { tripId, optionId } = req.params as { tripId: string; optionId: string };
    const { value } = voteSchema.parse(req.body);
    return flightService.vote(tripId, optionId, userId, value);
  });
}
