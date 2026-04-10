import { prisma } from '../../lib/prisma';
import { getStayProvider } from '../../providers/stays';
import { cacheGet, cacheSet } from '../../lib/redis';
import { NotFoundError } from '../../lib/errors';
import type { StaySearchParams } from '../../providers/stays/stay.interface';

export class StayService {
  async search(tripId: string, params: StaySearchParams) {
    const cacheKey = `stays:${params.destination}:${params.checkIn}:${params.checkOut}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const provider = getStayProvider();
    const results = await provider.searchStays(params);
    await cacheSet(cacheKey, JSON.stringify(results), 300);
    return results;
  }

  async saveStay(tripId: string, userId: string, data: any) {
    const saved = await prisma.savedStayOption.create({
      data: {
        ...data,
        tripId,
        savedById: userId,
        checkIn: data.checkIn ? new Date(data.checkIn) : null,
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
      },
      include: { savedBy: { select: { id: true, name: true } }, votes: true },
    });

    await prisma.activityEvent.create({
      data: { tripId, userId, type: 'OPTION_SAVED', payload: { type: 'stay', optionId: saved.id, name: data.name } },
    });

    return saved;
  }

  async vote(tripId: string, optionId: string, userId: string, value: 'UP' | 'DOWN') {
    const option = await prisma.savedStayOption.findUnique({ where: { id: optionId } });
    if (!option || option.tripId !== tripId) throw new NotFoundError('Stay option');

    const vote = await prisma.vote.upsert({
      where: { userId_targetType_targetId: { userId, targetType: 'STAY', targetId: optionId } },
      create: { userId, targetType: 'STAY', targetId: optionId, value },
      update: { value },
    });

    await prisma.activityEvent.create({
      data: { tripId, userId, type: 'VOTE_ADDED', payload: { type: 'stay', optionId, value } },
    });

    return vote;
  }

  async getSaved(tripId: string) {
    return prisma.savedStayOption.findMany({
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

export const stayService = new StayService();
