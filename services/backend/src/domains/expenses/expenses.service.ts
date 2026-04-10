import { prisma } from '../../lib/prisma';
import { AppError, NotFoundError } from '../../lib/errors';
import { calculateSettlements } from '../../utils/settlement';
import type { CreateExpenseInput } from './expenses.schema';

export class ExpenseService {
  async createExpense(tripId: string, userId: string, input: CreateExpenseInput) {
    // Validate paidBy is a trip member
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: input.paidById } },
    });
    if (!member) throw new AppError('Payer is not a trip member');

    // Calculate shares
    const participants = this.calculateShares(input);

    const expense = await prisma.expense.create({
      data: {
        tripId,
        paidById: input.paidById,
        title: input.title,
        amount: input.amount,
        currency: input.currency,
        category: input.category,
        splitType: input.splitType,
        notes: input.notes,
        date: input.date ? new Date(input.date) : new Date(),
        participants: { create: participants },
      },
      include: {
        paidBy: { select: { id: true, name: true } },
        participants: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    await prisma.activityEvent.create({
      data: {
        tripId,
        userId,
        type: 'EXPENSE_ADDED',
        payload: { title: input.title, amount: input.amount, currency: input.currency },
      },
    });

    return expense;
  }

  private calculateShares(input: CreateExpenseInput) {
    const { amount, splitType, participants } = input;

    if (splitType === 'EQUAL') {
      const share = Math.round((amount / participants.length) * 100) / 100;
      return participants.map((p) => ({ userId: p.userId, shareAmount: share }));
    }

    if (splitType === 'FIXED') {
      return participants.map((p) => ({
        userId: p.userId,
        shareAmount: p.shareAmount ?? 0,
      }));
    }

    if (splitType === 'PERCENTAGE') {
      return participants.map((p) => ({
        userId: p.userId,
        sharePercent: p.sharePercent ?? 0,
        shareAmount: Math.round(((p.sharePercent ?? 0) / 100) * amount * 100) / 100,
      }));
    }

    if (splitType === 'CUSTOM') {
      return participants.map((p) => ({
        userId: p.userId,
        shareAmount: p.shareAmount ?? 0,
      }));
    }

    return participants.map((p) => ({
      userId: p.userId,
      shareAmount: Math.round((amount / participants.length) * 100) / 100,
    }));
  }

  async getExpenses(tripId: string) {
    return prisma.expense.findMany({
      where: { tripId },
      include: {
        paidBy: { select: { id: true, name: true, avatarUrl: true } },
        participants: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getSettlements(tripId: string) {
    const expenses = await prisma.expense.findMany({
      where: { tripId, status: 'PENDING' },
      include: {
        participants: true,
        paidBy: { select: { id: true, name: true } },
      },
    });

    const members = await prisma.tripMember.findMany({
      where: { tripId },
      include: { user: { select: { id: true, name: true } } },
    });

    const settlements = calculateSettlements(expenses, members.map((m) => m.user));

    // Persist/update settlement suggestions
    await prisma.settlementSuggestion.deleteMany({ where: { tripId, settled: false } });
    if (settlements.suggestions.length > 0) {
      await prisma.settlementSuggestion.createMany({
        data: settlements.suggestions.map((s) => ({
          tripId,
          fromUserId: s.fromUserId,
          toUserId: s.toUserId,
          amount: s.amount,
          currency: 'USD',
        })),
      });
    }

    return settlements;
  }
}

export const expenseService = new ExpenseService();
