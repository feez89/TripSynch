import { z } from 'zod';
import type { AIProvider, TripBrief, PlanningResult } from './ai.interface';

// TODO: Install and configure the openai package
// import OpenAI from 'openai';

const planningResultSchema = z.object({
  summary: z.string(),
  neighborhood: z.string(),
  days: z.array(z.object({
    dayNumber: z.number(),
    date: z.string().optional(),
    theme: z.string(),
    activities: z.array(z.object({
      time: z.string().optional(),
      title: z.string(),
      description: z.string(),
      category: z.string(),
      estimatedCost: z.number().optional(),
      location: z.string().optional(),
    })),
    meals: z.object({
      breakfast: z.string().optional(),
      lunch: z.string().optional(),
      dinner: z.string().optional(),
    }).optional(),
    notes: z.string().optional(),
  })),
  budgetEstimate: z.object({
    flights: z.object({ min: z.number(), max: z.number() }).optional(),
    accommodation: z.object({ min: z.number(), max: z.number() }).optional(),
    dailyExpenses: z.object({ min: z.number(), max: z.number() }).optional(),
    total: z.object({ min: z.number(), max: z.number() }).optional(),
    currency: z.string(),
  }),
  flightSummary: z.string(),
  staySummary: z.string(),
  openQuestions: z.array(z.string()),
});

const SYSTEM_PROMPT = `You are an expert travel planner. Generate detailed, practical trip itineraries.
Always respond with valid JSON matching the exact schema provided. Be specific, actionable, and realistic about costs.`;

export class OpenAIProvider implements AIProvider {
  // TODO: Initialize OpenAI client with API key
  // private client: OpenAI;

  constructor() {
    // TODO: this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured. Use MockAIProvider for development.');
    }
  }

  async generateTripPlan(brief: TripBrief): Promise<PlanningResult> {
    // TODO: Implement actual OpenAI call
    /*
    const numDays = brief.startDate && brief.endDate
      ? Math.ceil((new Date(brief.endDate).getTime() - new Date(brief.startDate).getTime()) / 86400000)
      : 5;

    const userPrompt = `Plan a trip to ${brief.destination}.
Dates: ${brief.startDate || 'flexible'} to ${brief.endDate || 'flexible'} (${numDays} days)
Travelers: ${brief.travelers || 2}
Budget: ${brief.budgetMin || 'flexible'} - ${brief.budgetMax || 'flexible'} ${brief.currency || 'USD'}
Vibe: ${brief.vibe || 'balanced'}
Pace: ${brief.pace || 'BALANCED'}
Preferences: food=${brief.foodPref}, nightlife=${brief.nightlifePref}, nature=${brief.naturePref}, culture=${brief.culturePref}
Stay: ${brief.stayPreference || 'FLEXIBLE'}
Notes: ${brief.extraNotes || 'none'}

Return a JSON object with this exact structure: [schema]`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response from OpenAI');

    const parsed = JSON.parse(raw);
    return planningResultSchema.parse(parsed);
    */
    throw new Error('OpenAI provider not yet configured. Set AI_PROVIDER=mock for development.');
  }
}
