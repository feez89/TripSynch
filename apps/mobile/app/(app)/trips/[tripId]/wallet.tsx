import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useExpenses, useSettlements, useCreateExpense } from '../../../../src/hooks/useExpenses';
import { useTrip } from '../../../../src/hooks/useTrips';
import { useAuthStore } from '../../../../src/stores/auth.store';
import { Button } from '../../../../src/components/ui/Button';
import { Input } from '../../../../src/components/ui/Input';
import { ExpenseCard } from '../../../../src/components/wallet/ExpenseCard';
import { Card } from '../../../../src/components/ui/Card';
import { EmptyState } from '../../../../src/components/ui/EmptyState';
import { colors, spacing, typography } from '../../../../src/constants/theme';

const CATEGORY_OPTIONS = ['ACCOMMODATION', 'FLIGHTS', 'FOOD', 'TRANSPORT', 'ACTIVITIES', 'SHOPPING', 'OTHER'];
const SPLIT_TYPES = ['EQUAL', 'CUSTOM', 'PERCENTAGE'];

export default function WalletScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: trip } = useTrip(tripId);
  const { data: expenses, isLoading } = useExpenses(tripId);
  const { data: settlements } = useSettlements(tripId);
  const createExpense = useCreateExpense(tripId);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title: '',
      amount: '',
      category: 'OTHER',
      paidBy: user?.id || '',
      splitType: 'EQUAL',
      notes: '',
    },
  });

  const handleAddExpense = async (data: any) => {
    if (!data.title || !data.amount) {
      return Alert.alert('Required fields', 'Please fill in title and amount');
    }

    try {
      await createExpense.mutateAsync({
        title: data.title,
        amount: parseFloat(data.amount),
        category: data.category,
        paidById: data.paidBy,
        splitType: data.splitType,
        participants: selectedParticipants.length > 0 ? selectedParticipants : trip?.members?.map((m: any) => m.userId) || [],
        notes: data.notes,
      });
      reset();
      setSelectedParticipants([]);
      setShowExpenseModal(false);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to add expense');
    }
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const getBalance = (userId: string) => {
    return settlements?.find((s: any) => s.userId === userId)?.balance || 0;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={typography.h2}>💸 Wallet & Expenses</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Balance Summary */}
        {settlements && settlements.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Balance Summary</Text>
            {settlements.map((settlement: any) => {
              const balance = settlement.balance;
              const isPositive = balance > 0;
              return (
                <View key={settlement.userId} style={styles.balanceRow}>
                  <Text style={styles.balanceName}>{settlement.userName}</Text>
                  <Text style={[styles.balanceAmount, { color: isPositive ? colors.success : colors.danger }]}>
                    {isPositive ? '+' : ''} ${Math.abs(balance).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}

        {/* Settlement Suggestions */}
        {settlements && settlements.some((s: any) => s.settleWith) && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Settlement Suggestions</Text>
            {settlements.map((settlement: any) => (
              settlement.settleWith ? (
                <View key={`${settlement.userId}-${settlement.settleWith}`} style={styles.settlementRow}>
                  <Text style={styles.settlementText}>
                    {settlement.userName} owes {settlement.settleWithName} ${settlement.settleAmount.toFixed(2)}
                  </Text>
                </View>
              ) : null
            ))}
          </Card>
        )}

        {/* Expenses List */}
        {expenses && expenses.length > 0 ? (
          <View style={styles.expensesSection}>
            <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
              <Text style={styles.sectionTitle}>Recent Expenses</Text>
            </View>
            {expenses.map((expense: any) => (
              <View key={expense.id} style={{ paddingHorizontal: spacing.md }}>
                <ExpenseCard expense={expense} currentUserId={user?.id || ''} />
              </View>
            ))}
          </View>
        ) : (
          !isLoading && (
            <EmptyState
              icon="💸"
              title="No expenses yet"
              subtitle="Add the first expense to get started with tracking"
            />
          )
        )}
      </ScrollView>

      {/* FAB for Add Expense */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowExpenseModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Expense Modal */}
      <Modal visible={showExpenseModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modal}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={typography.h2}>Add Expense</Text>
                <TouchableOpacity onPress={() => setShowExpenseModal(false)}>
                  <Text style={styles.close}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <Controller control={control} name="title" render={({ field: { onChange, value, onBlur } }) => (
                  <Input label="Title" placeholder="Dinner at restaurant" onChangeText={onChange} onBlur={onBlur} value={value} />
                )} />

                <Controller control={control} name="amount" render={({ field: { onChange, value, onBlur } }) => (
                  <Input label="Amount" placeholder="0.00" onChangeText={onChange} onBlur={onBlur} value={value} keyboardType="decimal-pad" />
                )} />

                <View>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.categoryPills}>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.pill, watch('category') === cat && styles.pillActive]}
                        onPress={() => (control as any).setValue('category', cat)}
                      >
                        <Text style={[styles.pillText, watch('category') === cat && styles.pillTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text style={styles.label}>Paid By</Text>
                  <View style={styles.pills}>
                    {trip?.members?.map((member: any) => (
                      <TouchableOpacity
                        key={member.userId}
                        style={[styles.pill, watch('paidBy') === member.userId && styles.pillActive]}
                        onPress={() => (control as any).setValue('paidBy', member.userId)}
                      >
                        <Text style={[styles.pillText, watch('paidBy') === member.userId && styles.pillTextActive]}>
                          {member.user.name.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text style={styles.label}>Split Type</Text>
                  <View style={styles.pills}>
                    {SPLIT_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.pill, watch('splitType') === type && styles.pillActive]}
                        onPress={() => (control as any).setValue('splitType', type)}
                      >
                        <Text style={[styles.pillText, watch('splitType') === type && styles.pillTextActive]}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text style={styles.label}>Split With</Text>
                  <View style={styles.participantPills}>
                    {trip?.members?.map((member: any) => (
                      <TouchableOpacity
                        key={member.userId}
                        style={[styles.participantPill, selectedParticipants.includes(member.userId) && styles.participantPillActive]}
                        onPress={() => toggleParticipant(member.userId)}
                      >
                        <Text style={[styles.participantPillText, selectedParticipants.includes(member.userId) && styles.participantPillTextActive]}>
                          {selectedParticipants.includes(member.userId) ? '✓ ' : ''}{member.user.name.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Controller control={control} name="notes" render={({ field: { onChange, value, onBlur } }) => (
                  <Input label="Notes (optional)" placeholder="Add details..." onChangeText={onChange} onBlur={onBlur} value={value} multiline numberOfLines={2} style={{ height: 60, textAlignVertical: 'top' }} />
                )} />

                <Button
                  title="Add Expense"
                  onPress={handleSubmit(handleAddExpense)}
                  loading={createExpense.isPending}
                  size="lg"
                  style={{ marginTop: spacing.md }}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  balanceName: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  balanceAmount: { fontSize: 14, fontWeight: '700' },
  settlementRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  settlementText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  expensesSection: { marginTop: spacing.md },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  fabText: { fontSize: 28, color: '#fff', fontWeight: '700' },
  modal: { flex: 1, backgroundColor: colors.background },
  modalContent: { paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.md },
  close: { fontSize: 24, color: colors.textMuted },
  modalForm: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: 16, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
  categoryPills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  pill: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pillTextActive: { color: '#fff' },
  participantPills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  participantPill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  participantPillActive: { backgroundColor: colors.success, borderColor: colors.success },
  participantPillText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  participantPillTextActive: { color: '#fff' },
});
