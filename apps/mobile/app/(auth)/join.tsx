import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useJoinTrip } from '../../src/hooks/useTrips';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function JoinScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const joinTrip = useJoinTrip();

  const handleJoin = async () => {
    if (!code.trim()) return Alert.alert('Enter an invite code');
    try {
      const trip = await joinTrip.mutateAsync(code.trim().toUpperCase());
      router.replace(`/(app)/trips/${trip.id}`);
    } catch (e: any) {
      Alert.alert('Failed to join', e.response?.data?.error || 'Invalid invite code.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={typography.h2}>Join a Trip</Text>
      <Text style={[typography.small, { marginBottom: spacing.lg }]}>Enter the invite code shared by your trip organizer</Text>
      <Input
        label="Invite Code"
        placeholder="e.g. DEMO2024"
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        autoCapitalize="characters"
      />
      <Button title="Join Trip" onPress={handleJoin} loading={joinTrip.isPending} size="lg" />
      <Button title="Back" onPress={() => router.back()} variant="ghost" style={{ marginTop: spacing.sm }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 80 },
});
