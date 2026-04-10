'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useExpenses, useSettlements, useCreateExpense } from '@/hooks/useExpenses';
import { useTrip } from '@/hooks/useTrips';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Plus, Wallet, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

const CATEGORY_OPTIONS = [
  { label: 'Accommodation', value: 'ACCOMMODATION' },
  { label: 'Flights', value: 'FLIGHTS' },
  { label: 'Food', value: 'FOOD' },
  { label: 'Transport', value: 'TRANSPORT' },
  { label: 'Activities', value: 'ACTIVITIES' },
  { label: 'Shopping', value: 'SHOPPING' },
  { label: 'Other', value: 'OTHER' },
];

const expenseSchema = z.object({
  title: z.string().min(1, 'Required'),
  amount: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  paidById: z.string().min(1, 'Required'),
  splitType: z.enum(['EQUAL', 'CUSTOM']),
  participants: z.array(z.string()).min(1, 'Select at least one participant'),
  notes: z.string().optional(),
});
type ExpenseForm = z.infer<typeof expenseSchema>;

export default function WalletPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { data: trip } = useTrip(tripId);
  const { data: expenses, isLoading: expensesLoading } = useExpenses(tripId);
  const { data: settlements, isLoading: settlementsLoading } = useSettlements(tripId);
  const createExpense = useCreateExpense(tripId);

  usePageTitle('Wallet');
  const [showForm, setShowForm] = useState(false);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { splitType: 'EQUAL', participants: [] },
  });

  const members = trip?.members || [];

  // Normalise member shape: backend nests user data under member.user
  const memberUsers = members.map((m: any) => ({
    memberId: m.id,
    userId: m.user?.id ?? m.userId ?? m.id,
    name: m.user?.name ?? m.name ?? 'Unknown',
    avatarUrl: m.user?.avatarUrl ?? m.avatarUrl,
  }));

  const onSubmit = async (data: ExpenseForm) => {
    try {
      await createExpense.mutateAsync({
        title: data.title,
        amount: parseFloat(data.amount),
        category: data.category,
        paidById: data.paidById,
        splitType: data.splitType,
        notes: data.notes,
        // participants must be [{ userId }] objects with user IDs
        participants: data.participants.map((userId) => ({ userId })),
      });
      reset();
      setShowForm(false);
      setSelectedParticipantIds([]);
    } catch (e: any) {
      console.error(e);
    }
  };

  const toggleParticipant = (userId: string) => {
    const updated = selectedParticipantIds.includes(userId)
      ? selectedParticipantIds.filter((p) => p !== userId)
      : [...selectedParticipantIds, userId];
    setSelectedParticipantIds(updated);
    // Keep react-hook-form in sync so validation fires correctly
    setValue('participants', updated, { shouldValidate: true });
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return TrendingUp;
    if (balance < 0) return TrendingDown;
    return null;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/trips/${tripId}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Trip Wallet</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <DollarSign size={18} /> Expenses
              </h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="expense-title" className="text-sm font-medium text-slate-700 block mb-1">Expense Title *</label>
                    <input
                      {...register('title')}
                      id="expense-title"
                      required
                      placeholder="Hotel booking, Flight..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.title && <p role="alert" className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="expense-amount" className="text-sm font-medium text-slate-700 block mb-1">Amount ($) *</label>
                      <input
                        {...register('amount')}
                        id="expense-amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="100"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {errors.amount && <p role="alert" className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="expense-category" className="text-sm font-medium text-slate-700 block mb-1">Category *</label>
                      <select
                        {...register('category')}
                        id="expense-category"
                        required
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select...</option>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      {errors.category && <p role="alert" className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="expense-paid-by" className="text-sm font-medium text-slate-700 block mb-1">Paid By *</label>
                    <select
                      {...register('paidById')}
                      id="expense-paid-by"
                      required
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select...</option>
                      {memberUsers.map((m: any) => (
                        <option key={m.userId} value={m.userId}>{m.name}</option>
                      ))}
                    </select>
                    {errors.paidById && <p className="text-red-500 text-xs mt-1">{errors.paidById.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Split Type *</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input {...register('splitType')} type="radio" value="EQUAL" className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm">Equal Split</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input {...register('splitType')} type="radio" value="CUSTOM" className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm">Custom Split</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Participants *</label>
                    <div className="space-y-2">
                      {memberUsers.map((m: any) => (
                        <label key={m.userId} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedParticipantIds.includes(m.userId)}
                            onChange={() => toggleParticipant(m.userId)}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm">{m.name}</span>
                        </label>
                      ))}
                    </div>
                    {errors.participants && <p className="text-red-500 text-xs mt-1">{errors.participants.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
                    <textarea
                      {...register('notes')}
                      placeholder="Additional details..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-16"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={createExpense.isPending}
                      className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {createExpense.isPending ? 'Saving...' : 'Add Expense'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); reset(); setSelectedParticipantIds([]); }}
                      className="flex-1 bg-slate-200 text-slate-900 py-2.5 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {expensesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
            ) : expenses && expenses.length > 0 ? (
              <div className="space-y-3">
                {expenses.map((expense: any) => (
                  <div key={expense.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{expense.title}</h3>
                      <span className="text-lg font-bold text-indigo-600">${expense.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <span>{expense.paidBy?.name ?? expense.paidByName ?? 'Unknown'} paid</span>
                      <span>•</span>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{expense.category}</span>
                    </div>
                    {expense.participants && (
                      <p className="text-xs text-slate-500">
                        Split among: {expense.participants.map((p: any) => p.user?.name ?? p.name ?? 'Unknown').join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No expenses yet. Add an expense to start tracking.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h2 className="font-semibold mb-4">Balances</h2>
            {settlementsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
              </div>
            ) : settlements?.balances && settlements.balances.length > 0 ? (
              <div className="space-y-3">
                {settlements.balances.map((b: any) => {
                  const balance = b.netBalance;
                  const Icon = getBalanceIcon(balance);
                  return (
                    <div key={b.userId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                          {b.name?.charAt(0) ?? '?'}
                        </div>
                        <span className="text-sm font-medium">{b.name}</span>
                      </div>
                      <div className={`flex items-center gap-1 font-bold ${getBalanceColor(balance)}`}>
                        {Icon && <Icon size={14} />}
                        ${Math.abs(balance).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {members.length > 0 ? 'Add expenses to see balances.' : 'No members yet'}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold mb-4">Settlements</h2>
            {settlementsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
              </div>
            ) : settlements?.suggestions && settlements.suggestions.length > 0 ? (
              <div className="space-y-3">
                {settlements.suggestions.map((s: any, i: number) => (
                  <div key={i} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <p className="text-sm font-semibold text-slate-900">
                      {s.fromName} owes {s.toName}
                    </p>
                    <p className="text-lg font-bold text-indigo-600">${s.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">All settled up!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
