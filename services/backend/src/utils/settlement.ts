export interface ExpenseRecord {
  id: string;
  amount: number;
  currency: string;
  paidById: string;
  participants: {
    userId: string;
    shareAmount: number;
  }[];
}

export interface UserBalance {
  userId: string;
  name: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // positive = is owed money; negative = owes money
}

export interface SettlementSuggestion {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export interface SettlementResult {
  balances: UserBalance[];
  suggestions: SettlementSuggestion[];
  totalExpenses: number;
  currency: string;
}

export function calculateSettlements(
  expenses: ExpenseRecord[],
  users: { id: string; name: string }[]
): SettlementResult {
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  // Initialize balance map
  const balanceMap = new Map<string, { paid: number; owed: number }>();
  users.forEach((u) => balanceMap.set(u.id, { paid: 0, owed: 0 }));

  let totalExpenses = 0;

  for (const expense of expenses) {
    totalExpenses += expense.amount;

    // Credit the payer
    const payer = balanceMap.get(expense.paidById);
    if (payer) payer.paid += expense.amount;

    // Debit participants
    for (const participant of expense.participants) {
      const p = balanceMap.get(participant.userId);
      if (p) p.owed += participant.shareAmount;
    }
  }

  // Calculate net balances
  const balances: UserBalance[] = [];
  for (const [userId, { paid, owed }] of balanceMap.entries()) {
    balances.push({
      userId,
      name: userMap.get(userId) || 'Unknown',
      totalPaid: Math.round(paid * 100) / 100,
      totalOwed: Math.round(owed * 100) / 100,
      netBalance: Math.round((paid - owed) * 100) / 100,
    });
  }

  // Generate minimized settlement suggestions
  const suggestions = minimizeSettlements(balances, userMap);

  return {
    balances,
    suggestions,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    currency: 'USD',
  };
}

function minimizeSettlements(
  balances: UserBalance[],
  userMap: Map<string, string>
): SettlementSuggestion[] {
  const suggestions: SettlementSuggestion[] = [];

  // Separate debtors (negative balance) and creditors (positive balance)
  const debtors = balances
    .filter((b) => b.netBalance < -0.01)
    .map((b) => ({ userId: b.userId, name: b.name, amount: Math.abs(b.netBalance) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter((b) => b.netBalance > 0.01)
    .map((b) => ({ userId: b.userId, name: b.name, amount: b.netBalance }))
    .sort((a, b) => b.amount - a.amount);

  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    if (settleAmount > 0.01) {
      suggestions.push({
        fromUserId: debtor.userId,
        fromName: debtor.name,
        toUserId: creditor.userId,
        toName: creditor.name,
        amount: Math.round(settleAmount * 100) / 100,
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) di++;
    if (creditor.amount < 0.01) ci++;
  }

  return suggestions;
}
