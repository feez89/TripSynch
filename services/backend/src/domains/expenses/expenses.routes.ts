import { FastifyInstance } from 'fastify';
import { expenseService } from './expenses.service';
import { createExpenseSchema } from './expenses.schema';
import { requireTripMember } from '../../middleware/auth.middleware';

export async function expenseRoutes(fastify: FastifyInstance) {
  fastify.post('/:tripId/expenses', { preHandler: requireTripMember }, async (req, reply) => {
    const userId = (req as any).authUser.id;
    const { tripId } = req.params as { tripId: string };
    const body = createExpenseSchema.parse(req.body);
    return reply.status(201).send(await expenseService.createExpense(tripId, userId, body));
  });

  fastify.get('/:tripId/expenses', { preHandler: requireTripMember }, async (req) => {
    const { tripId } = req.params as { tripId: string };
    return expenseService.getExpenses(tripId);
  });

  fastify.get('/:tripId/settlements', { preHandler: requireTripMember }, async (req) => {
    const { tripId } = req.params as { tripId: string };
    return expenseService.getSettlements(tripId);
  });
}
