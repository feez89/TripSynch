import { prisma } from '../../lib/prisma';
import { getFlightProvider } from '../../providers/flights';
import { cacheGet, cacheSet } from '../../lib/redis';
import { NotFoundError } from '../../lib/errors';
import type { FlightSearchParams } from '../../providers/flights/flight.interface';

export class FlightService {
  async search(tripId: string, params: any) {
    const provider = getFlightProvider();

    // ── Multi-origin: fan out one search per unique departure city ──
    if (params.origins) {
      const originList = (params.origins as string)
        .split(',')
        .map((s: string) => s.trim().toUpperCase())
        .filter((s: string) => s.length >= 2);
      const uniqueOrigins = [...new Set(originList)] as string[];

      const results = await Promise.all(
        uniqueOrigins.map(async (origin) => {
          const searchParams: FlightSearchParams = {
            origin,
            destination: params.destination,
            departDate: params.departDate,
            returnDate: params.returnDate,
            adults: params.adults,
            cabinClass: params.cabinClass,
            currency: params.currency,
          };
          const cacheKey = `flights:${origin}:${params.destination}:${params.departDate}:${params.returnDate || 'oneway'}:${params.cabinClass}`;
          const cached = await cacheGet(cacheKey);
          let flights;
          if (cached) {
            flights = JSON.parse(cached);
          } else {
            flights = await provider.searchFlights(searchParams);
            await cacheSet(cacheKey, JSON.stringify(flights), 300);
          }
          return { origin, flights };
        })
      );

      return { grouped: true, results };
    }

    // ── Single-origin (backward-compat) ──
    const cacheKey = `flights:${params.origin}:${params.destination}:${params.departDate}:${params.returnDate || 'oneway'}:${params.cabinClass}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const flights = await provider.searchFlights(params as FlightSearchParams);
    await cacheSet(cacheKey, JSON.stringify(flights), 300);
    return flights;
  }

  async saveFlight(tripId: string, userId: string, data: any) {
    const saved = await prisma.savedFlightOption.create({
      data: { ...data, tripId, savedById: userId, departDate: new Date(data.departDate), returnDate: data.returnDate ? new Date(data.returnDate) : null },
      include: { savedBy: { select: { id: true, name: true } }, votes: true },
    });

    await prisma.activityEvent.create({
      data: { tripId, userId, type: 'OPTION_SAVED', payload: { type: 'flight', optionId: saved.id, airline: data.airline } },
    });

    return saved;
  }

  async vote(tripId: string, optionId: string, userId: string, value: 'UP' | 'DOWN') {
    const option = await prisma.savedFlightOption.findUnique({ where: { id: optionId } });
    if (!option || option.tripId !== tripId) throw new NotFoundError('Flight option');

    const vote = await prisma.vote.upsert({
      where: { userId_targetType_targetId: { userId, targetType: 'FLIGHT', targetId: optionId } },
      create: { userId, targetType: 'FLIGHT', targetId: optionId, value },
      update: { value },
    });

    await prisma.activityEvent.create({
      data: { tripId, userId, type: 'VOTE_ADDED', payload: { type: 'flight', optionId, value } },
    });

    return vote;
  }

  async getSaved(tripId: string) {
    return prisma.savedFlightOption.findMany({
      where: { tripId },
      include: {
        savedBy: { select: { id: true, name: true } },
        votes: { include: { user: { select: { id: true, name: true } } } },
        comments: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const flightService = new FlightService();
