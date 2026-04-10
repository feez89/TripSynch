import { z } from 'zod';

export const staySearchSchema = z.object({
  destination: z.string().min(1),
  checkIn: z.string(),
  checkOut: z.string(),
  adults: z.number().int().min(1).default(2),
  rooms: z.number().int().min(1).default(1),
  currency: z.string().default('USD'),
  type: z.enum(['hotel', 'rental', 'all']).default('all'),
});

export const saveStaySchema = z.object({
  externalId: z.string().optional(),
  provider: z.string().default('mock'),
  name: z.string(),
  type: z.string().default('hotel'),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  checkIn: z.string().optional().nullable(),
  checkOut: z.string().optional().nullable(),
  pricePerNight: z.number(),
  totalPrice: z.number().optional(),
  currency: z.string().default('USD'),
  starRating: z.number().optional(),
  amenities: z.array(z.string()).default([]),
  cancellationPolicy: z.string().optional(),
  imageUrl: z.string().optional(),
  deepLink: z.string().optional(),
  notes: z.string().optional(),
});

export const voteSchema = z.object({
  value: z.enum(['UP', 'DOWN']),
});
