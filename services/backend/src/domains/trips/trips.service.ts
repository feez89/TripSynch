import { prisma } from '../../lib/prisma';
import { NotFoundError, ForbiddenError } from '../../lib/errors';
import type { CreateTripInput } from './trips.schema';

export class TripService {
  async createTrip(userId: string, input: CreateTripInput) {
    const trip = await prisma.trip.create({
      data: {
        name: input.name,
        destination: input.destination,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        departureAirport: input.departureAirport,
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        currency: input.currency || 'USD',
        members: {
          create: { userId, role: 'organizer' },
        },
        preferences: input.preferences
          ? { create: input.preferences }
          : undefined,
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        preferences: true,
      },
    });

    await prisma.activityEvent.create({
      data: {
        tripId: trip.id,
        userId,
        type: 'USER_JOINED',
        payload: { role: 'organizer' },
      },
    });

    return trip;
  }

  async getUserTrips(userId: string) {
    return prisma.trip.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
        _count: {
          select: { savedFlights: true, savedStays: true, expenses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTripById(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
        preferences: true,
        itinerary: { include: { days: true } },
        _count: {
          select: { savedFlights: true, savedStays: true, savedRentals: true, expenses: true },
        },
      },
    });
    if (!trip) throw new NotFoundError('Trip');
    const isMember = trip.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError('Not a trip member');
    return trip;
  }

  async generateInviteLink(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundError('Trip');
    return { inviteCode: trip.inviteCode, inviteLink: `tripsync://join/${trip.inviteCode}` };
  }

  async joinTrip(inviteCode: string, userId: string) {
    const trip = await prisma.trip.findUnique({ where: { inviteCode } });
    if (!trip) throw new NotFoundError('Trip (invalid invite code)');

    const existing = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId: trip.id, userId } },
    });
    if (existing) return trip; // already a member, idempotent

    await prisma.tripMember.create({ data: { tripId: trip.id, userId, role: 'member' } });
    await prisma.activityEvent.create({
      data: { tripId: trip.id, userId, type: 'USER_JOINED' },
    });
    return trip;
  }
}

export const tripService = new TripService();
