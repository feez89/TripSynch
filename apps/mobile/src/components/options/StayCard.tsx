import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../../constants/theme';

interface StayCardProps {
  stay: any;
  onSave?: () => void;
  onVote?: (value: 'UP' | 'DOWN') => void;
  saved?: boolean;
  myVote?: 'UP' | 'DOWN' | null;
  showActions?: boolean;
}

export function StayCard({ stay, onSave, onVote, saved, myVote, showActions = true }: StayCardProps) {
  const upCount = stay.votes?.filter((v: any) => v.value === 'UP').length || 0;
  const downCount = stay.votes?.filter((v: any) => v.value === 'DOWN').length || 0;
  const stars = stay.starRating ? '⭐'.repeat(Math.round(stay.starRating)) : null;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{stay.name}</Text>
          {stay.address && <Text style={styles.address} numberOfLines={1}>📍 {stay.address}</Text>}
          {stars && <Text style={styles.stars}>{stars}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.price}>${stay.pricePerNight?.toLocaleString()}</Text>
          <Text style={styles.priceLabel}>/night</Text>
          {stay.totalPrice && <Text style={styles.totalPrice}>Total: ${stay.totalPrice?.toLocaleString()}</Text>}
        </View>
      </View>

      {stay.amenities?.length > 0 && (
        <View style={styles.amenities}>
          {stay.amenities.slice(0, 4).map((a: string) => (
            <View key={a} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{a}</Text>
            </View>
          ))}
        </View>
      )}

      {stay.cancellationPolicy && (
        <Text style={styles.cancellation}>🔒 {stay.cancellationPolicy}</Text>
      )}

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
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  topRow: { flexDirection: 'row', marginBottom: spacing.sm },
  name: { ...typography.h3, fontSize: 16, flex: 1, marginRight: spacing.sm },
  address: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  stars: { fontSize: 12, marginTop: 2 },
  price: { fontSize: 20, fontWeight: '700', color: colors.primary },
  priceLabel: { fontSize: 11, color: colors.textMuted },
  totalPrice: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  amenityTag: { backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.border },
  amenityText: { fontSize: 11, color: colors.textSecondary },
  cancellation: { fontSize: 12, color: colors.success, marginBottom: spacing.sm },
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
