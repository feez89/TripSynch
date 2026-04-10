import { z } from 'zod';

export const flightSearchSchema = z.object({
  // Single-origin (legacy / when all travellers depart from the same city)
  origin: z.string().min(2).max(4).optional(),
  // Multi-origin: comma-separated IATA codes, e.g. "LAX,ORD,JFK"
  origins: z.string().optional(),
  destination: z.string().min(2).max(10),
  departDate: z.string(),
  returnDate: z.string().optional(),
  adults: z.number().int().min(1).default(1),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).default('economy'),
  currency: z.string().default('USD'),
}).refine(d => d.origin || d.origins, { message: 'Provide origin or origins' });

export const saveFlightSchema = z.object({
  externalId: z.string().optional(),
  provider: z.string().default('mock'),
  origin: z.string(),
  destination: z.string(),
  departDate: z.string().datetime(),
  returnDate: z.string().datetime().optional().nullable(),
  airline: z.string(),
  flightNum: z.string().optional(),
  durationMin: z.number().optional(),
  stops: z.number().int().default(0),
  price: z.number(),
  currency: z.string().default('USD'),
  cabinClass: z.string().default('economy'),
  deepLink: z.string().optional(),
  rawData: z.any().optional(),
  notes: z.string().optional(),
});

export const voteSchema = z.object({
  value: z.enum(['UP', 'DOWN']),
});
