import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../../constants/theme';

const CATEGORY_ICONS: Record<string, string> = {
  ACCOMMODATION: '🏨',
  FLIGHTS: '✈️',
  FOOD: '🍽️',
  TRANSPORT: '🚗',
  ACTIVITIES: '🎯',
  SHOPPING: '🛍️',
  OTHER: '💸',
};

interface ExpenseCardProps {
  expense: any;
  currentUserId: string;
}

export function ExpenseCard({ expense, currentUserId }: ExpenseCardProps) {
  const icon = CATEGORY_ICONS[expense.category] || '💸';
  const myShare = expense.participants?.find((p: any) => p.userId === currentUserId)?.shareAmount;
  const iAmPayer = expense.paidById === currentUserId;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{expense.title}</Text>
          <Text style={styles.sub}>Paid by {iAmPayer ? 'you' : expense.paidBy?.name}</Text>
          <Text style={styles.sub}>
            {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.amount}>${expense.amount.toLocaleString()}</Text>
          {myShare !== undefined && !iAmPayer && (
            <Text style={styles.share}>Your share: ${myShare.toFixed(2)}</Text>
          )}
          {iAmPayer && <Text style={[styles.share, { color: colors.success }]}>You paid</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  icon: { fontSize: 24, marginTop: 2 },
  title: { ...typography.body, fontWeight: '600' },
  sub: { ...typography.small, marginTop: 2 },
  amount: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  share: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
