import { z } from 'zod';

export const saveRentalSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  priceEstimate: z.number().optional(),
  currency: z.string().default('USD'),
  beds: z.number().int().optional(),
  bedrooms: z.number().int().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const voteSchema = z.object({
  value: z.enum(['UP', 'DOWN']),
});
