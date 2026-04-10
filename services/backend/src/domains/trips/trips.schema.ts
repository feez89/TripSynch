import { z } from 'zod';

export const createTripSchema = z.object({
  name: z.string().min(1).max(200),
  destination: z.string().min(1),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  departureAirport: z.string().optional(),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  currency: z.string().default('USD'),
  preferences: z.object({
    vibe: z.string().optional(),
    pace: z.enum(['RELAXED', 'BALANCED', 'PACKED']).default('BALANCED'),
    stayPreference: z.enum(['HOTEL', 'RENTAL', 'FLEXIBLE']).default('FLEXIBLE'),
    foodPref: z.boolean().default(true),
    nightlifePref: z.boolean().default(false),
    naturePref: z.boolean().default(false),
    culturePref: z.boolean().default(false),
    extraNotes: z.string().optional(),
  }).optional(),
});

export const updateTripSchema = createTripSchema.partial();

export const joinTripSchema = z.object({
  inviteCode: z.string().min(1),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
