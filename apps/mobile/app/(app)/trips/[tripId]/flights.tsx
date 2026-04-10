import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useFlightSearch, useSaveFlight, useVoteFlight } from '../../../../src/hooks/useFlights';
import { useAuthStore } from '../../../../src/stores/auth.store';
import { Button } from '../../../../src/components/ui/Button';
import { Input } from '../../../../src/components/ui/Input';
import { FlightCard } from '../../../../src/components/options/FlightCard';
import { EmptyState } from '../../../../src/components/ui/EmptyState';
import { colors, spacing, typography } from '../../../../src/constants/theme';

export default function FlightsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [showSearch, setShowSearch] = useState(false);
  const [searchParams, setSearchParams] = useState<any>(null);
  const { data: flights, isLoading, isFetching } = useFlightSearch(tripId, searchParams, !!searchParams);
  const saveFlight = useSaveFlight(tripId);
  const voteFlight = useVoteFlight(tripId);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      origin: '',
      destination: '',
      departDate: '',
      returnDate: '',
      cabinClass: 'ECONOMY',
    },
  });

  const onSubmit = (data: any) => {
    if (!data.origin || !data.destination || !data.departDate) {
      return Alert.alert('Required fields', 'Please fill in origin, destination, and departure date');
    }
    setSearchParams(data);
    setShowSearch(false);
  };

  const handleSave = async (flight: any) => {
    try {
      await saveFlight.mutateAsync(flight);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to save flight');
    }
  };

  const handleVote = async (optionId: string, value: 'UP' | 'DOWN') => {
    try {
      await voteFlight.mutateAsync({ optionId, value });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to vote');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={typography.h2}>✈️ Find Flights</Text>
        </View>

        {!showSearch ? (
          <Button
            title="Search Flights"
            onPress={() => setShowSearch(true)}
            size="lg"
            style={{ margin: spacing.md }}
          />
        ) : (
          <View style={styles.searchForm}>
            <Controller control={control} name="origin" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Origin (IATA)" placeholder="JFK" onChangeText={onChange} onBlur={onBlur} value={value} autoCapitalize="characters" />
            )} />
            <Controller control={control} name="destination" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Destination (IATA)" placeholder="BCN" onChangeText={onChange} onBlur={onBlur} value={value} autoCapitalize="characters" />
            )} />
            <Controller control={control} name="departDate" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Depart Date" placeholder="2024-07-15" onChangeText={onChange} onBlur={onBlur} value={value} />
            )} />
            <Controller control={control} name="returnDate" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Return Date (optional)" placeholder="2024-07-22" onChangeText={onChange} onBlur={onBlur} value={value} />
            )} />
            <Controller control={control} name="cabinClass" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Cabin Class" placeholder="ECONOMY" onChangeText={onChange} onBlur={onBlur} value={value} />
            )} />
            <Button
              title="Search"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}

        {isLoading && <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.xl }} />}

        {flights && flights.length > 0 && (
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
            <Text style={styles.resultCount}>{flights.length} flights found</Text>
            {flights.map((flight: any) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onSave={() => handleSave(flight)}
                onVote={(value) => handleVote(flight.id, value)}
                saved={flight.isSaved}
                myVote={flight.myVote}
              />
            ))}
          </View>
        )}

        {!isLoading && searchParams && flights?.length === 0 && (
          <EmptyState
            icon="✈️"
            title="No flights found"
            subtitle="Try adjusting your search criteria"
          />
        )}

        {!searchParams && !showSearch && (
          <EmptyState
            icon="🔍"
            title="Start searching"
            subtitle="Click 'Search Flights' to find flights for your trip"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  searchForm: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: 16, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  resultCount: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm, fontWeight: '600' },
});
