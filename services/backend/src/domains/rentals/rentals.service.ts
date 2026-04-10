import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';

export class RentalService {
  async saveRental(tripId: string, userId: string, data: any) {
    const saved = await prisma.savedRentalOption.create({
      data: { ...data, tripId, savedById: userId },
      include: { savedBy: { select: { id: true, name: true } }, votes: true },
    });

    await prisma.activityEvent.create({
      data: { tripId, userId, type: 'OPTION_SAVED', payload: { type: 'rental', optionId: saved.id, title: data.title } },
    });

    return saved;
  }

  async vote(tripId: string, optionId: string, userId: string, value: 'UP' | 'DOWN') {
    const option = await prisma.savedRentalOption.findUnique({ where: { id: optionId } });
    if (!option || option.tripId !== tripId) throw new NotFoundError('Rental option');

    const vote = await prisma.vote.upsert({
      where: { userId_targetType_targetId: { userId, targetType: 'RENTAL', targetId: optionId } },
      create: { userId, targetType: 'RENTAL', targetId: optionId, value },
      update: { value },
    });

    await prisma.activityEvent.create({
      data: { tripId, userId, type: 'VOTE_ADDED', payload: { type: 'rental', optionId, value } },
    });

    return vote;
  }

  async getSaved(tripId: string) {
    return prisma.savedRentalOption.findMany({
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

export const rentalService = new RentalService();
