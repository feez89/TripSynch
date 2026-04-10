import type { AIProvider, TripBrief, PlanningResult } from './ai.interface';

export class MockAIProvider implements AIProvider {
  async generateTripPlan(brief: TripBrief): Promise<PlanningResult> {
    const days = [];
    const start = brief.startDate ? new Date(brief.startDate) : new Date();
    const end = brief.endDate ? new Date(brief.endDate) : new Date(Date.now() + 5 * 86400000);
    const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));

    for (let i = 0; i < Math.min(numDays, 7); i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({
        dayNumber: i + 1,
        date: d.toISOString().split('T')[0],
        theme: i === 0 ? 'Arrival & Exploration' : i === numDays - 1 ? 'Final Day & Departure' : `Day ${i + 1} Adventures`,
        activities: [
          {
            time: '09:00',
            title: `Explore ${brief.destination} highlights`,
            description: `Discover the best of ${brief.destination} with a morning walk through the main attractions.`,
            category: 'sightseeing',
            estimatedCost: 0,
            location: brief.destination,
          },
          {
            time: '14:00',
            title: 'Lunch at a local spot',
            description: 'Try authentic local cuisine at a well-rated restaurant.',
            category: 'food',
            estimatedCost: 25,
          },
          {
            time: '16:00',
            title: brief.culturePref ? 'Museum or gallery visit' : 'Neighborhood stroll',
            description: brief.culturePref
              ? 'Visit a top-rated cultural attraction.'
              : 'Explore a charming local neighborhood.',
            category: brief.culturePref ? 'culture' : 'exploration',
            estimatedCost: brief.culturePref ? 15 : 0,
          },
        ],
        meals: {
          breakfast: 'Hotel breakfast or local café',
          lunch: 'Local restaurant',
          dinner: brief.nightlifePref ? 'Dinner + evening out' : 'Restaurant near hotel',
        },
      });
    }

    const budgetMin = brief.budgetMin || 1000;
    const budgetMax = brief.budgetMax || 3000;

    return {
      summary: `A ${brief.pace?.toLowerCase() || 'balanced'} trip to ${brief.destination} for ${brief.travelers || 2} travelers. Expect a mix of sightseeing, great food, and relaxation${brief.nightlifePref ? ' with some nightlife' : ''}.`,
      neighborhood: `Central ${brief.destination} — great access to main attractions, restaurants, and transport.`,
      days,
      budgetEstimate: {
        flights: { min: Math.round(budgetMin * 0.35), max: Math.round(budgetMax * 0.4) },
        accommodation: { min: Math.round(budgetMin * 0.3), max: Math.round(budgetMax * 0.35) },
        dailyExpenses: { min: Math.round(budgetMin * 0.02), max: Math.round(budgetMax * 0.025) },
        total: { min: budgetMin, max: budgetMax },
        currency: brief.currency || 'USD',
      },
      flightSummary: `Look for direct or 1-stop flights to ${brief.destination}. Budget airlines often offer the best rates 4-6 weeks out. Departing from ${brief.departureAirport || 'your nearest major airport'}.`,
      staySummary: `For ${brief.stayPreference === 'RENTAL' ? 'a vacation rental' : brief.stayPreference === 'HOTEL' ? 'a hotel' : 'accommodation'} in ${brief.destination}, the central area offers the best value and access. Aim for 3-4 star properties for a good balance of comfort and cost.`,
      openQuestions: [
        'Have you confirmed everyone\'s PTO/availability?',
        'Do any travelers have dietary restrictions?',
        `Will you need a visa for ${brief.destination}?`,
        'Do you want travel insurance?',
      ],
    };
  }
}
