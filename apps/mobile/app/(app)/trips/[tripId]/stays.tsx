import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useStaySearch, useSaveStay, useVoteStay } from '../../../../src/hooks/useStays';
import { Button } from '../../../../src/components/ui/Button';
import { Input } from '../../../../src/components/ui/Input';
import { StayCard } from '../../../../src/components/options/StayCard';
import { EmptyState } from '../../../../src/components/ui/EmptyState';
import { colors, spacing, typography } from '../../../../src/constants/theme';

export default function StaysScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchParams, setSearchParams] = useState<any>(null);
  const { data: stays, isLoading } = useStaySearch(tripId, searchParams, !!searchParams);
  const saveStay = useSaveStay(tripId);
  const voteStay = useVoteStay(tripId);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      destination: '',
      checkInDate: '',
      checkOutDate: '',
      guests: '1',
    },
  });

  const onSubmit = (data: any) => {
    if (!data.destination || !data.checkInDate || !data.checkOutDate) {
      return Alert.alert('Required fields', 'Please fill in destination and dates');
    }
    setSearchParams(data);
    setShowSearch(false);
  };

  const handleSave = async (stay: any) => {
    try {
      await saveStay.mutateAsync(stay);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to save stay');
    }
  };

  const handleVote = async (optionId: string, value: 'UP' | 'DOWN') => {
    try {
      await voteStay.mutateAsync({ optionId, value });
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
          <Text style={typography.h2}>🏨 Find Stays</Text>
        </View>

        {!showSearch ? (
          <Button
            title="Search Stays"
            onPress={() => setShowSearch(true)}
            size="lg"
            style={{ margin: spacing.md }}
          />
        ) : (
          <View style={styles.searchForm}>
            <Controller control={control} name="destination" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Destination" placeholder="Barcelona" onChangeText={onChange} onBlur={onBlur} value={value} />
            )} />
            <Controller control={control} name="checkInDate" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Check-in Date" placeholder="2024-07-15" onChangeText={onChange} onBlur={onBlur} value={value} />
            )} />
            <Controller control={control} name="checkOutDate" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Check-out Date" placeholder="2024-07-22" onChangeText={onChange} onBlur={onBlur} value={value} />
            )} />
            <Controller control={control} name="guests" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Number of Guests" placeholder="1" onChangeText={onChange} onBlur={onBlur} value={value} keyboardType="numeric" />
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

        {stays && stays.length > 0 && (
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
            <Text style={styles.resultCount}>{stays.length} stays found</Text>
            {stays.map((stay: any) => (
              <StayCard
                key={stay.id}
                stay={stay}
                onSave={() => handleSave(stay)}
                onVote={(value) => handleVote(stay.id, value)}
                saved={stay.isSaved}
                myVote={stay.myVote}
              />
            ))}
          </View>
        )}

        {!isLoading && searchParams && stays?.length === 0 && (
          <EmptyState
            icon="🏨"
            title="No stays found"
            subtitle="Try adjusting your search criteria"
          />
        )}

        {!searchParams && !showSearch && (
          <EmptyState
            icon="🔍"
            title="Start searching"
            subtitle="Click 'Search Stays' to find accommodations for your trip"
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
