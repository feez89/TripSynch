import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActivity } from '../../../../src/hooks/useActivity';
import { Card } from '../../../../src/components/ui/Card';
import { EmptyState } from '../../../../src/components/ui/EmptyState';
import { colors, spacing, typography } from '../../../../src/constants/theme';

const EVENT_ICONS: Record<string, string> = {
  USER_JOINED: '👋',
  OPTION_SAVED: '📌',
  VOTE_ADDED: '🗳️',
  EXPENSE_ADDED: '💸',
  ITINERARY_GENERATED: '🤖',
  COMMENT_ADDED: '💬',
};

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ActivityScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { data: activities, isLoading, refetch } = useActivity(tripId);

  const getActivityDescription = (event: any): string => {
    switch (event.type) {
      case 'USER_JOINED':
        return `${event.actor.name} joined the trip`;
      case 'OPTION_SAVED':
        return `${event.actor.name} saved a ${event.metadata?.optionType || 'option'}`;
      case 'VOTE_ADDED':
        return `${event.actor.name} voted on a ${event.metadata?.optionType || 'option'}`;
      case 'EXPENSE_ADDED':
        return `${event.actor.name} added an expense: ${event.metadata?.title || 'Expense'}`;
      case 'ITINERARY_GENERATED':
        return `${event.actor.name} generated an itinerary`;
      case 'COMMENT_ADDED':
        return `${event.actor.name} left a comment`;
      default:
        return event.type;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={typography.h2}>📰 Activity Feed</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {activities && activities.length > 0 ? (
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
            {activities.map((event: any, index: number) => {
              const icon = EVENT_ICONS[event.type] || '📝';
              const description = getActivityDescription(event);
              const timestamp = formatTime(event.createdAt);

              return (
                <Card key={event.id || index} style={styles.activityCard}>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityIcon}>{icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityText}>{description}</Text>
                      <Text style={styles.activityTime}>{timestamp}</Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          !isLoading && (
            <EmptyState
              icon="📰"
              title="No activity yet"
              subtitle="Activities from your trip will appear here"
            />
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  activityCard: { marginBottom: spacing.sm },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  activityIcon: { fontSize: 20, marginTop: 2 },
  activityText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', lineHeight: 20 },
  activityTime: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
