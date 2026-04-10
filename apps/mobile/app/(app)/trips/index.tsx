import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrips } from '../../../src/hooks/useTrips';
import { TripCard } from '../../../src/components/trip/TripCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { Button } from '../../../src/components/ui/Button';
import { colors, spacing, typography } from '../../../src/constants/theme';

export default function TripsScreen() {
  const router = useRouter();
  const { data: trips, isLoading, refetch } = useTrips();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.h1}>My Trips</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(app)/trips/create')}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trips || []}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={() => router.push(`/(app)/trips/${item.id}`)} />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={{ paddingVertical: spacing.sm, paddingBottom: 40 }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="✈️"
              title="No trips yet"
              subtitle="Create your first group trip and start planning together."
              action={
                <Button
                  title="Create a Trip"
                  onPress={() => router.push('/(app)/trips/create')}
                />
              }
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
