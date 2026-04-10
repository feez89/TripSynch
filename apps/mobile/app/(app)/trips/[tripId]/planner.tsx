import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useTrip } from '../../../../src/hooks/useTrips';
import { useGeneratePlan } from '../../../../src/hooks/usePlanning';
import { Button } from '../../../../src/components/ui/Button';
import { Input } from '../../../../src/components/ui/Input';
import { Card } from '../../../../src/components/ui/Card';
import { colors, spacing, typography } from '../../../../src/constants/theme';

export default function PlannerScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { data: trip } = useTrip(tripId);
  const generatePlan = useGeneratePlan(tripId);
  const [planResult, setPlanResult] = useState<any>(null);
  const [pace, setPace] = useState<'RELAXED' | 'BALANCED' | 'PACKED'>('BALANCED');
  const [stayPref, setStayPref] = useState<'HOTEL' | 'RENTAL' | 'FLEXIBLE'>('FLEXIBLE');
  const [prefs, setPrefs] = useState({ food: true, nightlife: false, nature: false, culture: false });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      destination: trip?.destination || '',
      startDate: trip?.startDate?.split('T')[0] || '',
      endDate: trip?.endDate?.split('T')[0] || '',
      budgetMin: trip?.budgetMin?.toString() || '',
      budgetMax: trip?.budgetMax?.toString() || '',
      travelers: '2',
      vibe: trip?.preferences?.vibe || '',
      extraNotes: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const result = await generatePlan.mutateAsync({
        destination: data.destination,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        budgetMin: data.budgetMin ? parseInt(data.budgetMin) : undefined,
        budgetMax: data.budgetMax ? parseInt(data.budgetMax) : undefined,
        travelers: parseInt(data.travelers) || 2,
        vibe: data.vibe,
        pace,
        stayPreference: stayPref,
        foodPref: prefs.food,
        nightlifePref: prefs.nightlife,
        naturePref: prefs.nature,
        culturePref: prefs.culture,
        extraNotes: data.extraNotes,
      });
      setPlanResult(result);
    } catch (e: any) {
      Alert.alert('Planning failed', e.response?.data?.error || 'Something went wrong.');
    }
  };

  const togglePref = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  if (planResult) {
    return <PlannerResults result={planResult} onBack={() => setPlanResult(null)} tripId={tripId} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={typography.h2}>🤖 AI Trip Planner</Text>
          <Text style={[typography.small, { marginTop: 4 }]}>Fill in your details and get a personalized itinerary</Text>
        </View>

        <View style={styles.form}>
          <Controller control={control} name="destination" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Destination" placeholder="Barcelona, Spain" onChangeText={onChange} onBlur={onBlur} value={value} />
          )} />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="startDate" render={({ field: { onChange, value, onBlur } }) => (
                <Input label="Start Date" placeholder="2024-07-15" onChangeText={onChange} onBlur={onBlur} value={value} />
              )} />
            </View>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="endDate" render={({ field: { onChange, value, onBlur } }) => (
                <Input label="End Date" placeholder="2024-07-22" onChangeText={onChange} onBlur={onBlur} value={value} />
              )} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="budgetMin" render={({ field: { onChange, value, onBlur } }) => (
                <Input label="Budget Min $" placeholder="2000" onChangeText={onChange} onBlur={onBlur} value={value} keyboardType="numeric" />
              )} />
            </View>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="budgetMax" render={({ field: { onChange, value, onBlur } }) => (
                <Input label="Budget Max $" placeholder="4000" onChangeText={onChange} onBlur={onBlur} value={value} keyboardType="numeric" />
              )} />
            </View>
          </View>

          <Controller control={control} name="travelers" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Number of Travelers" placeholder="2" onChangeText={onChange} onBlur={onBlur} value={value} keyboardType="numeric" />
          )} />
          <Controller control={control} name="vibe" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Trip Vibe" placeholder="Beach & culture, nightlife, adventure..." onChangeText={onChange} onBlur={onBlur} value={value} />
          )} />

          <Text style={styles.label}>Pace</Text>
          <View style={styles.pills}>
            {(['RELAXED', 'BALANCED', 'PACKED'] as const).map((p) => (
              <TouchableOpacity key={p} style={[styles.pill, pace === p && styles.pillActive]} onPress={() => setPace(p)}>
                <Text style={[styles.pillText, pace === p && styles.pillTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Stay Preference</Text>
          <View style={styles.pills}>
            {(['HOTEL', 'RENTAL', 'FLEXIBLE'] as const).map((s) => (
              <TouchableOpacity key={s} style={[styles.pill, stayPref === s && styles.pillActive]} onPress={() => setStayPref(s)}>
                <Text style={[styles.pillText, stayPref === s && styles.pillTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Interests</Text>
          <View style={styles.pills}>
            {Object.entries({ food: '🍽️ Food', nightlife: '🎉 Nightlife', nature: '🌿 Nature', culture: '🏛️ Culture' }).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.pill, prefs[key as keyof typeof prefs] && styles.pillActive]}
                onPress={() => togglePref(key as keyof typeof prefs)}
              >
                <Text style={[styles.pillText, prefs[key as keyof typeof prefs] && styles.pillTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Controller control={control} name="extraNotes" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Extra Notes" placeholder="Any special requests..." onChangeText={onChange} onBlur={onBlur} value={value} multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />
          )} />

          <Button
            title={generatePlan.isPending ? 'Generating...' : '✨ Generate Itinerary'}
            onPress={handleSubmit(onSubmit)}
            loading={generatePlan.isPending}
            size="lg"
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlannerResults({ result, onBack, tripId }: { result: any; onBack: () => void; tripId: string }) {
  const router = useRouter();
  const { planningResult } = result;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>← Regenerate</Text>
          </TouchableOpacity>
          <Text style={typography.h2}>Your Itinerary ✨</Text>
        </View>

        <Card style={styles.resultCard}>
          <Text style={styles.sectionTitle}>Trip Summary</Text>
          <Text style={styles.summaryText}>{planningResult.summary}</Text>
        </Card>

        <Card style={styles.resultCard}>
          <Text style={styles.sectionTitle}>📍 Neighborhood Recommendation</Text>
          <Text style={styles.summaryText}>{planningResult.neighborhood}</Text>
        </Card>

        {planningResult.days?.map((day: any) => (
          <Card key={day.dayNumber} style={styles.resultCard}>
            <Text style={styles.dayTitle}>Day {day.dayNumber}{day.date ? ` — ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}` : ''}</Text>
            <Text style={styles.dayTheme}>{day.theme}</Text>
            {day.activities?.map((act: any, i: number) => (
              <View key={i} style={styles.activity}>
                {act.time && <Text style={styles.actTime}>{act.time}</Text>}
                <View style={{ flex: 1 }}>
                  <Text style={styles.actTitle}>{act.title}</Text>
                  <Text style={styles.actDesc}>{act.description}</Text>
                  {act.estimatedCost != null && act.estimatedCost > 0 && (
                    <Text style={styles.actCost}>~${act.estimatedCost}</Text>
                  )}
                </View>
              </View>
            ))}
          </Card>
        ))}

        {planningResult.openQuestions?.length > 0 && (
          <Card style={styles.resultCard}>
            <Text style={styles.sectionTitle}>❓ Open Questions</Text>
            {planningResult.openQuestions.map((q: string, i: number) => (
              <Text key={i} style={styles.question}>• {q}</Text>
            ))}
          </Card>
        )}

        <Button
          title="Back to Dashboard"
          onPress={() => router.back()}
          variant="secondary"
          style={{ margin: spacing.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  form: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: 16, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  pill: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pillTextActive: { color: '#fff' },
  resultCard: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  summaryText: { fontSize: 14, color: colors.textPrimary, lineHeight: 22 },
  dayTitle: { fontSize: 16, fontWeight: '700', color: colors.primary },
  dayTheme: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: 2 },
  activity: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  actTime: { fontSize: 12, color: colors.primary, fontWeight: '600', width: 40, marginTop: 2 },
  actTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  actDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  actCost: { fontSize: 12, color: colors.success, marginTop: 2 },
  question: { fontSize: 14, color: colors.textPrimary, marginBottom: 6, lineHeight: 20 },
});
