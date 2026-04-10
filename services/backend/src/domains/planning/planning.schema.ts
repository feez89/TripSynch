import { z } from 'zod';

export const planTripSchema = z.object({
  destination: z.string().min(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  currency: z.string().default('USD'),
  travelers: z.number().int().min(1).default(2),
  vibe: z.string().optional(),
  pace: z.enum(['RELAXED', 'BALANCED', 'PACKED']).default('BALANCED'),
  stayPreference: z.enum(['HOTEL', 'RENTAL', 'FLEXIBLE']).default('FLEXIBLE'),
  foodPref: z.boolean().default(true),
  nightlifePref: z.boolean().default(false),
  naturePref: z.boolean().default(false),
  culturePref: z.boolean().default(false),
  extraNotes: z.string().optional(),
});

export type PlanTripInput = z.infer<typeof planTripSchema>;
