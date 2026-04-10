import type { FlightProvider, FlightSearchParams, FlightResult } from './flight.interface';

const AIRLINES = ['Delta', 'United', 'American', 'Southwest', 'JetBlue', 'Alaska', 'Frontier', 'Spirit'];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDuration(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export class MockFlightProvider implements FlightProvider {
  async searchFlights(params: FlightSearchParams): Promise<FlightResult[]> {
    const results: FlightResult[] = [];
    const count = randomInt(6, 12);
    const basePrice = randomInt(180, 850);

    for (let i = 0; i < count; i++) {
      const airline = AIRLINES[i % AIRLINES.length];
      const stops = i < 3 ? 0 : i < 7 ? 1 : 2;
      const duration = randomInt(90, 90 + stops * 120 + randomInt(0, 60));
      const price = Math.round(basePrice + stops * -40 + randomInt(-50, 120));

      results.push({
        id: `mock-flight-${Date.now()}-${i}`,
        origin: params.origin,
        destination: params.destination,
        departDate: params.departDate,
        returnDate: params.returnDate,
        airline,
        flightNum: `${airline.substring(0, 2).toUpperCase()}${randomInt(100, 999)}`,
        durationMin: duration,
        stops,
        price: Math.max(99, price),
        currency: params.currency || 'USD',
        cabinClass: params.cabinClass || 'economy',
        deepLink: `https://example.com/flights/mock-${i}`,
      });
    }

    return results.sort((a, b) => a.price - b.price);
  }
}
