import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTrip } from '../../../src/hooks/useTrips';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { colors, spacing, typography } from '../../../src/constants/theme';

const schema = z.object({
  name: z.string().min(1, 'Trip name required'),
  destination: z.string().min(1, 'Destination required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  departureAirport: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function CreateTripScreen() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const [vibe, setVibe] = useState('');
  const [pace, setPace] = useState<'RELAXED' | 'BALANCED' | 'PACKED'>('BALANCED');
  const [stayPref, setStayPref] = useState<'HOTEL' | 'RENTAL' | 'FLEXIBLE'>('FLEXIBLE');

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      const trip = await createTrip.mutateAsync({
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        budgetMin: data.budgetMin ? parseInt(data.budgetMin) : undefined,
        budgetMax: data.budgetMax ? parseInt(data.budgetMax) : undefined,
        preferences: { vibe, pace, stayPreference: stayPref },
      });
      router.replace(`/(app)/trips/${trip.id}`);
    } catch (e: any) {
      Alert.alert('Failed to create trip', e.response?.data?.error || 'Something went wrong.');
    }
  };

  const paceOptions: Array<'RELAXED' | 'BALANCED' | 'PACKED'> = ['RELAXED', 'BALANCED', 'PACKED'];
  const stayOptions: Array<'HOTEL' | 'RENTAL' | 'FLEXIBLE'> = ['HOTEL', 'RENTAL', 'FLEXIBLE'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Text style={typography.h2}>New Trip</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Details</Text>
            <Controller control={control} name="name" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Trip Name" placeholder="Barcelona Summer 2024" onChangeText={onChange} onBlur={onBlur} value={value} error={errors.name?.message} />
            )} />
            <Controller control={control} name="destination" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Destination" placeholder="Barcelona, Spain" onChangeText={onChange} onBlur={onBlur} value={value} error={errors.destination?.message} />
            )} />
            <Controller control={control} name="departureAirport" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Departure Airport (IATA code)" placeholder="JFK" onChangeText={onChange} onBlur={onBlur} value={value} autoCapitalize="characters" />
            )} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dates</Text>
            <Controller control={control} name="startDate" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Start Date" placeholder="2024-07-15" onChangeText={onChange} onBlur={onBlur} value={value} />
            )} />
            <Controller control={control} name="endDate" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="End Date" placeholder="2024-07-22" onChangeText={onChange} onBlur={onBlur} value={value} />
            )} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget (USD)</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Controller control={control} name="budgetMin" render={({ field: { onChange, value, onBlur } }) => (
                  <Input label="Min $" placeholder="2000" onChangeText={onChange} onBlur={onBlur} value={value} keyboardType="numeric" />
                )} />
              </View>
              <View style={{ flex: 1 }}>
                <Controller control={control} name="budgetMax" render={({ field: { onChange, value, onBlur } }) => (
                  <Input label="Max $" placeholder="4000" onChangeText={onChange} onBlur={onBlur} value={value} keyboardType="numeric" />
                )} />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <Input label="Trip Vibe" placeholder="Adventure meets culture" value={vibe} onChangeText={setVibe} />

            <Text style={styles.label}>Pace</Text>
            <View style={styles.pills}>
              {paceOptions.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.pill, pace === p && styles.pillActive]}
                  onPress={() => setPace(p)}
                >
                  <Text style={[styles.pillText, pace === p && styles.pillTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Stay Preference</Text>
            <View style={styles.pills}>
              {stayOptions.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, stayPref === s && styles.pillActive]}
                  onPress={() => setStayPref(s)}
                >
                  <Text style={[styles.pillText, stayPref === s && styles.pillTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Create Trip"
            onPress={handleSubmit(onSubmit)}
            loading={createTrip.isPending}
            size="lg"
            style={{ margin: spacing.md }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 60 },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  section: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: 16, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  label: { ...typography.label, marginBottom: spacing.xs },
  pills: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  pill: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pillTextActive: { color: '#fff' },
});
