import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useSavedFlights, useVoteFlight } from '../../../../src/hooks/useFlights';
import { useSavedStays, useVoteStay } from '../../../../src/hooks/useStays';
import { Button } from '../../../../src/components/ui/Button';
import { Input } from '../../../../src/components/ui/Input';
import { FlightCard } from '../../../../src/components/options/FlightCard';
import { StayCard } from '../../../../src/components/options/StayCard';
import { EmptyState } from '../../../../src/components/ui/EmptyState';
import { Card } from '../../../../src/components/ui/Card';
import { colors, spacing, typography } from '../../../../src/constants/theme';

export default function SavedScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'flights' | 'stays' | 'rentals'>('flights');
  const [showRentalModal, setShowRentalModal] = useState(false);
  const { data: flights } = useSavedFlights(tripId);
  const { data: stays } = useSavedStays(tripId);
  const voteFlight = useVoteFlight(tripId);
  const voteStay = useVoteStay(tripId);
  const [rentals, setRentals] = useState<any[]>([]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      url: '',
      beds: '',
      priceEstimate: '',
    },
  });

  const handleAddRental = (data: any) => {
    const rental = {
      id: Date.now().toString(),
      ...data,
      beds: parseInt(data.beds) || 0,
      priceEstimate: parseInt(data.priceEstimate) || 0,
    };
    setRentals([...rentals, rental]);
    reset();
    setShowRentalModal(false);
  };

  const handleVoteFlight = async (optionId: string, value: 'UP' | 'DOWN') => {
    try {
      await voteFlight.mutateAsync({ optionId, value });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to vote');
    }
  };

  const handleVoteStay = async (optionId: string, value: 'UP' | 'DOWN') => {
    try {
      await voteStay.mutateAsync({ optionId, value });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to vote');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={typography.h2}>📋 Saved Options</Text>
      </View>

      <View style={styles.tabs}>
        {(['flights', 'stays', 'rentals'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'flights' ? '✈️ Flights' : tab === 'stays' ? '🏨 Stays' : '🏠 Rentals'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {activeTab === 'flights' && (
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
            {flights && flights.length > 0 ? (
              flights.map((flight: any) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onVote={(value) => handleVoteFlight(flight.id, value)}
                  myVote={flight.myVote}
                  saved
                  showActions={true}
                />
              ))
            ) : (
              <EmptyState
                icon="✈️"
                title="No saved flights"
                subtitle="Save flights from the search results to compare them here"
              />
            )}
          </View>
        )}

        {activeTab === 'stays' && (
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
            {stays && stays.length > 0 ? (
              stays.map((stay: any) => (
                <StayCard
                  key={stay.id}
                  stay={stay}
                  onVote={(value) => handleVoteStay(stay.id, value)}
                  myVote={stay.myVote}
                  saved
                  showActions={true}
                />
              ))
            ) : (
              <EmptyState
                icon="🏨"
                title="No saved stays"
                subtitle="Save accommodations from the search results to compare them here"
              />
            )}
          </View>
        )}

        {activeTab === 'rentals' && (
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
            {rentals.length > 0 ? (
              rentals.map((rental: any) => (
                <Card key={rental.id} style={{ marginBottom: spacing.sm }}>
                  <View style={styles.rentalRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rentalTitle}>{rental.title}</Text>
                      <Text style={styles.rentalMeta}>{rental.beds} bed{rental.beds !== 1 ? 's' : ''}</Text>
                      {rental.url && (
                        <Text style={styles.rentalUrl} numberOfLines={1}>{rental.url}</Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.rentalPrice}>${rental.priceEstimate}</Text>
                      <Text style={styles.rentalSub}>per night</Text>
                    </View>
                  </View>
                </Card>
              ))
            ) : (
              <EmptyState
                icon="🏠"
                title="No manual rentals"
                subtitle="Add custom rental options to compare"
              />
            )}

            <Button
              title="+ Add Rental"
              onPress={() => setShowRentalModal(true)}
              size="lg"
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
      </ScrollView>

      <Modal visible={showRentalModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modal}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={typography.h2}>Add Rental</Text>
                <TouchableOpacity onPress={() => setShowRentalModal(false)}>
                  <Text style={styles.close}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <Controller control={control} name="title" render={({ field: { onChange, value, onBlur } }) => (
                  <Input label="Title" placeholder="Airbnb Apartment" onChangeText={onChange} onBlur={onBlur} value={value} />
                )} />
                <Controller control={control} name="url" render={({ field: { onChange, value, onBlur } }) => (
                  <Input label="URL (optional)" placeholder="https://..." onChangeText={onChange} onBlur={onBlur} value={value} />
                )} />
                <Controller control={control} name="beds" render={({ field: { onChange, value, onBlur } }) => (
                  <Input label="Number of Beds" placeholder="2" onChangeText={onChange} onBlur={onBlur} value={value} keyboardType="numeric" />
                )} />
                <Controller control={control} name="priceEstimate" render={({ field: { onChange, value, onBlur } }) => (
                  <Input label="Price per Night" placeholder="150" onChangeText={onChange} onBlur={onBlur} value={value} keyboardType="numeric" />
                )} />

                <Button
                  title="Add Rental"
                  onPress={handleSubmit(handleAddRental)}
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
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  rentalRow: { flexDirection: 'row', alignItems: 'flex-start' },
  rentalTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  rentalMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  rentalUrl: { fontSize: 12, color: colors.primary, marginTop: 2 },
  rentalPrice: { fontSize: 18, fontWeight: '700', color: colors.primary },
  rentalSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  modal: { flex: 1, backgroundColor: colors.background },
  modalContent: { paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.md },
  close: { fontSize: 24, color: colors.textMuted },
  modalForm: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: 16, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
});
