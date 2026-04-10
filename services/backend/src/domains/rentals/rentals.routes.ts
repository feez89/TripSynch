import { FastifyInstance } from 'fastify';
import { rentalService } from './rentals.service';
import { saveRentalSchema, voteSchema } from './rentals.schema';
import { requireTripMember } from '../../middleware/auth.middleware';

export async function rentalRoutes(fastify: FastifyInstance) {
  fastify.get('/:tripId/rentals/saved', { preHandler: requireTripMember }, async (req) => {
    const { tripId } = req.params as { tripId: string };
    return rentalService.getSaved(tripId);
  });

  fastify.post('/:tripId/rentals/save', { preHandler: requireTripMember }, async (req, reply) => {
    const userId = (req as any).authUser.id;
    const { tripId } = req.params as { tripId: string };
    const body = saveRentalSchema.parse(req.body);
    return reply.status(201).send(await rentalService.saveRental(tripId, userId, body));
  });

  fastify.post('/:tripId/rentals/:optionId/vote', { preHandler: requireTripMember }, async (req) => {
    const userId = (req as any).authUser.id;
    const { tripId, optionId } = req.params as { tripId: string; optionId: string };
    const { value } = voteSchema.parse(req.body);
    return rentalService.vote(tripId, optionId, userId, value);
  });
}
