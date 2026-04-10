import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../../constants/theme';

interface FlightCardProps {
  flight: any;
  onSave?: () => void;
  onVote?: (value: 'UP' | 'DOWN') => void;
  saved?: boolean;
  myVote?: 'UP' | 'DOWN' | null;
  showActions?: boolean;
}

function formatDuration(min?: number) {
  if (!min) return '';
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function FlightCard({ flight, onSave, onVote, saved, myVote, showActions = true }: FlightCardProps) {
  const upCount = flight.votes?.filter((v: any) => v.value === 'UP').length || 0;
  const downCount = flight.votes?.filter((v: any) => v.value === 'DOWN').length || 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.airline}>{flight.airline}</Text>
          <Text style={styles.route}>{flight.origin} → {flight.destination}</Text>
          {flight.flightNum && <Text style={styles.flightNum}>{flight.flightNum}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.price}>${flight.price?.toLocaleString()}</Text>
          <Text style={styles.priceLabel}>per person</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        {flight.durationMin && <Text style={styles.meta}>⏱ {formatDuration(flight.durationMin)}</Text>}
        <Text style={styles.meta}>{flight.stops === 0 ? '✈️ Nonstop' : `🔄 ${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</Text>
        <Text style={styles.meta}>💺 {flight.cabinClass}</Text>
      </View>

      {showActions && (
        <View style={styles.actions}>
          <View style={styles.votes}>
            <TouchableOpacity
              style={[styles.voteBtn, myVote === 'UP' && styles.voteBtnActive]}
              onPress={() => onVote?.('UP')}
            >
              <Text style={styles.voteBtnText}>👍 {upCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.voteBtn, myVote === 'DOWN' && styles.voteBtnDown]}
              onPress={() => onVote?.('DOWN')}
            >
              <Text style={styles.voteBtnText}>👎 {downCount}</Text>
            </TouchableOpacity>
          </View>
          {onSave && (
            <TouchableOpacity
              style={[styles.saveBtn, saved && styles.saveBtnActive]}
              onPress={onSave}
            >
              <Text style={[styles.saveBtnText, saved && { color: '#fff' }]}>
                {saved ? '✓ Saved' : '+ Save'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  topRow: { flexDirection: 'row', marginBottom: spacing.sm },
  airline: { ...typography.h3, fontSize: 16 },
  route: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  flightNum: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  price: { fontSize: 22, fontWeight: '700', color: colors.primary },
  priceLabel: { fontSize: 11, color: colors.textMuted },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm, flexWrap: 'wrap' },
  meta: { fontSize: 13, color: colors.textSecondary },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.xs },
  votes: { flexDirection: 'row', gap: spacing.sm },
  voteBtn: { borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  voteBtnActive: { backgroundColor: colors.success, borderColor: colors.success },
  voteBtnDown: { backgroundColor: colors.danger, borderColor: colors.danger },
  voteBtnText: { fontSize: 13, fontWeight: '600' },
  saveBtn: { borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.primary },
  saveBtnActive: { backgroundColor: colors.primary },
  saveBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },
});
