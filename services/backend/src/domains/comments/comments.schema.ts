import { z } from 'zod';

export const createCommentSchema = z.object({
  targetType: z.enum(['FLIGHT', 'STAY', 'RENTAL']),
  targetId: z.string().cuid(),
  body: z.string().min(1).max(1000),
  tripId: z.string().cuid(),
});
