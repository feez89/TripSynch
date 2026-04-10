import { z } from 'zod';

export const createExpenseSchema = z.object({
  title: z.string().min(1).max(200),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  category: z.enum(['ACCOMMODATION', 'FLIGHTS', 'FOOD', 'TRANSPORT', 'ACTIVITIES', 'SHOPPING', 'OTHER']).default('OTHER'),
  paidById: z.string().cuid(),
  splitType: z.enum(['EQUAL', 'FIXED', 'PERCENTAGE', 'CUSTOM']).default('EQUAL'),
  notes: z.string().optional(),
  date: z.string().datetime().optional(),
  participants: z.array(z.object({
    userId: z.string().cuid(),
    shareAmount: z.number().optional(),
    sharePercent: z.number().optional(),
  })).min(1),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
