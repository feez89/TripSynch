import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../../constants/theme';
import { Badge } from '../ui/Badge';

interface TripCardProps {
  trip: any;
  onPress: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PLANNING: { bg: '#e0e7ff', color: '#6366f1' },
  BOOKED: { bg: '#d1fae5', color: '#059669' },
  TRAVELING: { bg: '#fef3c7', color: '#d97706' },
  COMPLETED: { bg: '#f1f5f9', color: '#64748b' },
};

function formatDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TripCard({ trip, onPress }: TripCardProps) {
  const statusStyle = STATUS_COLORS[trip.status] || STATUS_COLORS.PLANNING;
  const memberCount = trip.members?.length || 0;
  const start = formatDate(trip.startDate);
  const end = formatDate(trip.endDate);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{trip.name}</Text>
          <Text style={styles.destination} numberOfLines={1}>📍 {trip.destination}</Text>
        </View>
        <Badge label={trip.status} bg={statusStyle.bg} color={statusStyle.color} />
      </View>
      <View style={styles.meta}>
        {start && <Text style={styles.metaText}>📅 {start}{end ? ` → ${end}` : ''}</Text>}
        <Text style={styles.metaText}>👥 {memberCount} traveler{memberCount !== 1 ? 's' : ''}</Text>
        {trip.budgetMax && (
          <Text style={styles.metaText}>💰 Budget: ${trip.budgetMin?.toLocaleString() || '?'} – ${trip.budgetMax?.toLocaleString()}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  name: { ...typography.h3, flex: 1, marginRight: spacing.sm },
  destination: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  meta: { gap: 4 },
  metaText: { fontSize: 13, color: colors.textSecondary },
});
