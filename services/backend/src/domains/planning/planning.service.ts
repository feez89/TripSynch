import { prisma } from '../../lib/prisma';
import { getAIProvider } from '../../providers/ai';
import { NotFoundError } from '../../lib/errors';
import type { PlanTripInput } from './planning.schema';

export class PlanningService {
  async generatePlan(tripId: string, userId: string, input: PlanTripInput) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { members: true },
    });
    if (!trip) throw new NotFoundError('Trip');

    const aiProvider = getAIProvider();
    const result = await aiProvider.generateTripPlan({
      ...input,
      departureAirport: trip.departureAirport || undefined,
    } as any);

    // Upsert itinerary
    const itinerary = await prisma.itinerary.upsert({
      where: { tripId },
      create: {
        tripId,
        summary: result.summary,
        neighborhood: result.neighborhood,
        budgetEstimate: result.budgetEstimate as any,
        flightSummary: result.flightSummary,
        staySummary: result.staySummary,
        openQuestions: result.openQuestions,
        rawResponse: result as any,
        days: {
          create: result.days.map((day) => ({
            dayNumber: day.dayNumber,
            date: day.date ? new Date(day.date) : null,
            theme: day.theme,
            activities: day.activities as any,
            meals: day.meals as any,
            notes: day.notes,
          })),
        },
      },
      update: {
        summary: result.summary,
        neighborhood: result.neighborhood,
        budgetEstimate: result.budgetEstimate as any,
        flightSummary: result.flightSummary,
        staySummary: result.staySummary,
        openQuestions: result.openQuestions,
        rawResponse: result as any,
        days: {
          deleteMany: {},
          create: result.days.map((day) => ({
            dayNumber: day.dayNumber,
            date: day.date ? new Date(day.date) : null,
            theme: day.theme,
            activities: day.activities as any,
            meals: day.meals as any,
            notes: day.notes,
          })),
        },
      },
      include: { days: true },
    });

    await prisma.activityEvent.create({
      data: {
        tripId,
        userId,
        type: 'ITINERARY_GENERATED',
        payload: { destination: input.destination },
      },
    });

    return { itinerary, planningResult: result };
  }
}

export const planningService = new PlanningService();
