import { calculateSettlements } from '../settlement';

const users = [
  { id: 'alice', name: 'Alice' },
  { id: 'bob', name: 'Bob' },
  { id: 'sarah', name: 'Sarah' },
];

describe('calculateSettlements', () => {
  it('returns zero balances when no expenses', () => {
    const result = calculateSettlements([], users);
    expect(result.totalExpenses).toBe(0);
    expect(result.suggestions).toHaveLength(0);
    result.balances.forEach((b) => {
      expect(b.totalPaid).toBe(0);
      expect(b.totalOwed).toBe(0);
      expect(b.netBalance).toBe(0);
    });
  });

  it('handles a simple equal 3-way split', () => {
    const expenses = [
      {
        id: 'e1',
        amount: 300,
        currency: 'USD',
        paidById: 'alice',
        participants: [
          { userId: 'alice', shareAmount: 100 },
          { userId: 'bob', shareAmount: 100 },
          { userId: 'sarah', shareAmount: 100 },
        ],
      },
    ];

    const result = calculateSettlements(expenses, users);
    expect(result.totalExpenses).toBe(300);

    const alice = result.balances.find((b) => b.userId === 'alice')!;
    const bob = result.balances.find((b) => b.userId === 'bob')!;
    const sarah = result.balances.find((b) => b.userId === 'sarah')!;

    expect(alice.totalPaid).toBe(300);
    expect(alice.totalOwed).toBe(100);
    expect(alice.netBalance).toBe(200); // owed $200 back

    expect(bob.totalPaid).toBe(0);
    expect(bob.totalOwed).toBe(100);
    expect(bob.netBalance).toBe(-100); // owes $100

    expect(sarah.totalPaid).toBe(0);
    expect(sarah.totalOwed).toBe(100);
    expect(sarah.netBalance).toBe(-100);

    expect(result.suggestions).toHaveLength(2);
    const bobPays = result.suggestions.find((s) => s.fromUserId === 'bob');
    expect(bobPays?.toUserId).toBe('alice');
    expect(bobPays?.amount).toBe(100);
  });

  it('handles multiple payers with mixed amounts', () => {
    const expenses = [
      {
        id: 'e1',
        amount: 120,
        currency: 'USD',
        paidById: 'alice',
        participants: [
          { userId: 'alice', shareAmount: 40 },
          { userId: 'bob', shareAmount: 40 },
          { userId: 'sarah', shareAmount: 40 },
        ],
      },
      {
        id: 'e2',
        amount: 60,
        currency: 'USD',
        paidById: 'bob',
        participants: [
          { userId: 'alice', shareAmount: 20 },
          { userId: 'bob', shareAmount: 20 },
          { userId: 'sarah', shareAmount: 20 },
        ],
      },
    ];

    const result = calculateSettlements(expenses, users);
    expect(result.totalExpenses).toBe(180);

    const alice = result.balances.find((b) => b.userId === 'alice')!;
    const bob = result.balances.find((b) => b.userId === 'bob')!;

    expect(alice.netBalance).toBe(60);  // paid 120, owed 60 → net +60
    expect(bob.netBalance).toBe(0);     // paid 60, owed 60 → net 0
  });

  it('minimizes settlement transactions (classic 3-person case)', () => {
    // John owes $120, Sarah is owed $75, Mike is owed $45
    // Expected: John→Sarah $75, John→Mike $45
    const expenses = [
      {
        id: 'e1',
        amount: 195,
        currency: 'USD',
        paidById: 'bob',   // bob = "Sarah" (owed $75)
        participants: [
          { userId: 'alice', shareAmount: 120 }, // alice = "John" (owes $120)
          { userId: 'bob', shareAmount: 75 },
        ],
      },
      {
        id: 'e2',
        amount: 45,
        currency: 'USD',
        paidById: 'sarah', // sarah = "Mike" (owed $45)
        participants: [
          { userId: 'alice', shareAmount: 45 },
          { userId: 'sarah', shareAmount: 0 },
        ],
      },
    ];

    const result = calculateSettlements(expenses, users);

    const alice = result.balances.find((b) => b.userId === 'alice')!;
    expect(alice.netBalance).toBe(-165); // owes everything

    // At most 2 transactions needed
    expect(result.suggestions.length).toBeLessThanOrEqual(2);
    const totalSettled = result.suggestions.reduce((s, x) => s + x.amount, 0);
    expect(Math.abs(totalSettled - 165)).toBeLessThan(0.01);
  });

  it('handles percentage split correctly', () => {
    const expenses = [
      {
        id: 'e1',
        amount: 100,
        currency: 'USD',
        paidById: 'alice',
        participants: [
          { userId: 'alice', shareAmount: 50 },  // 50%
          { userId: 'bob', shareAmount: 30 },    // 30%
          { userId: 'sarah', shareAmount: 20 },  // 20%
        ],
      },
    ];

    const result = calculateSettlements(expenses, users);

    const alice = result.balances.find((b) => b.userId === 'alice')!;
    const bob = result.balances.find((b) => b.userId === 'bob')!;
    const sarah = result.balances.find((b) => b.userId === 'sarah')!;

    expect(alice.netBalance).toBe(50);  // paid 100, owes 50 → net +50
    expect(bob.netBalance).toBe(-30);
    expect(sarah.netBalance).toBe(-20);
  });

  it('produces empty suggestions when everyone is balanced', () => {
    const expenses = [
      {
        id: 'e1',
        amount: 60,
        currency: 'USD',
        paidById: 'alice',
        participants: [
          { userId: 'alice', shareAmount: 20 },
          { userId: 'bob', shareAmount: 20 },
          { userId: 'sarah', shareAmount: 20 },
        ],
      },
      {
        id: 'e2',
        amount: 60,
        currency: 'USD',
        paidById: 'bob',
        participants: [
          { userId: 'alice', shareAmount: 20 },
          { userId: 'bob', shareAmount: 20 },
          { userId: 'sarah', shareAmount: 20 },
        ],
      },
      {
        id: 'e3',
        amount: 60,
        currency: 'USD',
        paidById: 'sarah',
        participants: [
          { userId: 'alice', shareAmount: 20 },
          { userId: 'bob', shareAmount: 20 },
          { userId: 'sarah', shareAmount: 20 },
        ],
      },
    ];

    const result = calculateSettlements(expenses, users);
    result.balances.forEach((b) => expect(Math.abs(b.netBalance)).toBeLessThan(0.01));
    expect(result.suggestions).toHaveLength(0);
  });

  it('handles single participant (one person trip)', () => {
    const expenses = [
      {
        id: 'e1',
        amount: 50,
        currency: 'USD',
        paidById: 'alice',
        participants: [{ userId: 'alice', shareAmount: 50 }],
      },
    ];
    const result = calculateSettlements(expenses, [users[0]]);
    expect(result.suggestions).toHaveLength(0);
    expect(result.balances[0].netBalance).toBe(0);
  });
});
