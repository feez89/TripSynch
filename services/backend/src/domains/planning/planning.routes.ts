import { FastifyInstance } from 'fastify';
import { planningService } from './planning.service';
import { planTripSchema } from './planning.schema';
import { requireTripMember } from '../../middleware/auth.middleware';

export async function planningRoutes(fastify: FastifyInstance) {
  fastify.post('/:tripId/plan', { preHandler: requireTripMember }, async (req) => {
    const userId = (req as any).authUser.id;
    const { tripId } = req.params as { tripId: string };
    const body = planTripSchema.parse(req.body);
    return planningService.generatePlan(tripId, userId, body);
  });
}
