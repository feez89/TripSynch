import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrip } from '../../../../src/hooks/useTrips';
import { Badge } from '../../../../src/components/ui/Badge';
import { Card } from '../../../../src/components/ui/Card';
import { colors, spacing, typography } from '../../../../src/constants/theme';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PLANNING: { bg: '#e0e7ff', color: '#6366f1' },
  BOOKED: { bg: '#d1fae5', color: '#059669' },
  TRAVELING: { bg: '#fef3c7', color: '#d97706' },
  COMPLETED: { bg: '#f1f5f9', color: '#64748b' },
};

export default function TripDashboard() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { data: trip, isLoading, refetch } = useTrip(tripId);

  if (isLoading || !trip) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const statusStyle = STATUS_COLORS[trip.status] || STATUS_COLORS.PLANNING;
  const startDate = trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;
  const endDate = trip.endDate ? new Date(trip.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

  const navCard = (icon: string, label: string, route: string) => (
    <TouchableOpacity
      key={label}
      style={styles.navCard}
      onPress={() => router.push(route as any)}
      activeOpacity={0.8}
    >
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Trips</Text>
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={typography.h1} numberOfLines={2}>{trip.name}</Text>
              <Text style={styles.destination}>📍 {trip.destination}</Text>
            </View>
            <Badge label={trip.status} bg={statusStyle.bg} color={statusStyle.color} />
          </View>
        </View>

        <Card style={styles.card}>
          {(startDate || endDate) && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoText}>{startDate}{endDate ? ` → ${endDate}` : ''}</Text>
            </View>
          )}
          {trip.departureAirport && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🛫</Text>
              <Text style={styles.infoText}>Departing from {trip.departureAirport}</Text>
            </View>
          )}
          {trip.budgetMax && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>💰</Text>
              <Text style={styles.infoText}>
                Budget: ${trip.budgetMin?.toLocaleString() || '?'} – ${trip.budgetMax?.toLocaleString()} {trip.currency}
              </Text>
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>👥 Travelers ({trip.members?.length})</Text>
          <View style={styles.avatarRow}>
            {trip.members?.map((m: any) => (
              <View key={m.userId} style={styles.avatarChip}>
                <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                  <Text style={styles.avatarInitial}>{m.user.name[0]?.toUpperCase()}</Text>
                </View>
                <Text style={styles.avatarName} numberOfLines={1}>{m.user.name.split(' ')[0]}</Text>
                {m.role === 'organizer' && <Text style={styles.organizer}>★</Text>}
              </View>
            ))}
          </View>
        </Card>

        {trip.itinerary && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>🗓️ AI Itinerary</Text>
            <Text style={styles.summaryText} numberOfLines={3}>{trip.itinerary.summary}</Text>
            <TouchableOpacity onPress={() => router.push(`/(app)/trips/${tripId}/planner`)}>
              <Text style={styles.viewMore}>View full itinerary →</Text>
            </TouchableOpacity>
          </Card>
        )}

        <View style={styles.navGrid}>
          {navCard('🤖', 'AI Planner', `/(app)/trips/${tripId}/planner`)}
          {navCard('✈️', 'Flights', `/(app)/trips/${tripId}/flights`)}
          {navCard('🏨', 'Stays', `/(app)/trips/${tripId}/stays`)}
          {navCard('📋', 'Saved Options', `/(app)/trips/${tripId}/saved`)}
          {navCard('💸', 'Wallet', `/(app)/trips/${tripId}/wallet`)}
          {navCard('📰', 'Activity', `/(app)/trips/${tripId}/activity`)}
          {navCard('🔗', 'Invite', `/(app)/trips/${tripId}/invite`)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  destination: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoIcon: { fontSize: 16, marginRight: spacing.sm, width: 24 },
  infoText: { fontSize: 14, color: colors.textPrimary, flex: 1 },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  avatarChip: { alignItems: 'center', width: 56 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 18, fontWeight: '700', color: colors.primary },
  avatarName: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  organizer: { fontSize: 10, color: colors.secondary },
  summaryText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  viewMore: { color: colors.primary, fontWeight: '600', marginTop: spacing.sm, fontSize: 14 },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.sm },
  navCard: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md, width: '30%', alignItems: 'center', borderWidth: 1, borderColor: colors.border, flexGrow: 1 },
  navIcon: { fontSize: 24, marginBottom: spacing.xs },
  navLabel: { fontSize: 12, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
});
