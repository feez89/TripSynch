import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const hash = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', name: 'Alice Chen', passwordHash: hash },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { email: 'bob@example.com', name: 'Bob Kumar', passwordHash: hash },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: { email: 'sarah@example.com', name: 'Sarah Johnson', passwordHash: hash },
  });

  // Create a trip
  const trip = await prisma.trip.upsert({
    where: { inviteCode: 'DEMO2024' },
    update: {},
    create: {
      name: 'Barcelona Summer Trip',
      destination: 'Barcelona, Spain',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-22'),
      departureAirport: 'JFK',
      budgetMin: 2000,
      budgetMax: 4000,
      currency: 'USD',
      inviteCode: 'DEMO2024',
      members: {
        create: [
          { userId: alice.id, role: 'organizer' },
          { userId: bob.id, role: 'member' },
          { userId: sarah.id, role: 'member' },
        ],
      },
      preferences: {
        create: {
          vibe: 'Adventure meets culture',
          pace: 'BALANCED',
          stayPreference: 'HOTEL',
          foodPref: true,
          nightlifePref: true,
          culturePref: true,
        },
      },
    },
  });

  // Create sample expense
  await prisma.expense.create({
    data: {
      tripId: trip.id,
      paidById: alice.id,
      title: 'Hotel deposit',
      amount: 300,
      currency: 'USD',
      category: 'ACCOMMODATION',
      splitType: 'EQUAL',
      participants: {
        create: [
          { userId: alice.id, shareAmount: 100 },
          { userId: bob.id, shareAmount: 100 },
          { userId: sarah.id, shareAmount: 100 },
        ],
      },
    },
  });

  // Activity events
  await prisma.activityEvent.createMany({
    data: [
      { tripId: trip.id, userId: alice.id, type: 'USER_JOINED', payload: { role: 'organizer' } },
      { tripId: trip.id, userId: bob.id, type: 'USER_JOINED' },
      { tripId: trip.id, userId: sarah.id, type: 'USER_JOINED' },
    ],
  });

  console.log('Seed complete');
  console.log('Demo users: alice@example.com, bob@example.com, sarah@example.com (password: password123)');
  console.log(`Demo trip invite code: DEMO2024`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
