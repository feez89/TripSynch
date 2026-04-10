import { FastifyInstance } from 'fastify';
import { stayService } from './stays.service';
import { staySearchSchema, saveStaySchema, voteSchema } from './stays.schema';
import { requireTripMember } from '../../middleware/auth.middleware';

export async function stayRoutes(fastify: FastifyInstance) {
  fastify.get('/:tripId/stays/search', { preHandler: requireTripMember }, async (req) => {
    const { tripId } = req.params as { tripId: string };
    const params = staySearchSchema.parse(req.query);
    return stayService.search(tripId, params as any);
  });

  fastify.get('/:tripId/stays/saved', { preHandler: requireTripMember }, async (req) => {
    const { tripId } = req.params as { tripId: string };
    return stayService.getSaved(tripId);
  });

  fastify.post('/:tripId/stays/save', { preHandler: requireTripMember }, async (req, reply) => {
    const userId = (req as any).authUser.id;
    const { tripId } = req.params as { tripId: string };
    const body = saveStaySchema.parse(req.body);
    return reply.status(201).send(await stayService.saveStay(tripId, userId, body));
  });

  fastify.post('/:tripId/stays/:optionId/vote', { preHandler: requireTripMember }, async (req) => {
    const userId = (req as any).authUser.id;
    const { tripId, optionId } = req.params as { tripId: string; optionId: string };
    const { value } = voteSchema.parse(req.body);
    return stayService.vote(tripId, optionId, userId, value);
  });
}
