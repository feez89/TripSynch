import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrip, useGenerateInvite } from '../../../../src/hooks/useTrips';
import { Button } from '../../../../src/components/ui/Button';
import { Card } from '../../../../src/components/ui/Card';
import { colors, spacing, typography } from '../../../../src/constants/theme';

export default function InviteScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { data: trip } = useTrip(tripId);
  const generateInvite = useGenerateInvite(tripId);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const handleGenerateInvite = async () => {
    try {
      const result = await generateInvite.mutateAsync();
      setInviteCode(result.code || result.inviteCode);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to generate invite code');
    }
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      Alert.alert('Copied', inviteCode + ' copied to clipboard');
    }
  };

  const handleShare = async () => {
    if (inviteCode && trip) {
      try {
        await Share.share({
          message: `Join my trip "${trip.name}" on TripSync! Invite code: ${inviteCode}`,
          title: `Invite to ${trip.name}`,
        });
      } catch (e: any) {
        Alert.alert('Error', e.message);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={typography.h2}>🔗 Invite Travelers</Text>
        </View>

        {/* Invite Code Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Invite Code</Text>
          {inviteCode ? (
            <>
              <View style={styles.codeBox}>
                <Text style={styles.code}>{inviteCode}</Text>
              </View>
              <View style={styles.buttonRow}>
                <Button
                  title="Copy Code"
                  onPress={handleCopyCode}
                  variant="secondary"
                  size="sm"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Share"
                  onPress={handleShare}
                  size="sm"
                  style={{ flex: 1, marginLeft: spacing.sm }}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.helperText}>Generate an invite code to share with others</Text>
              <Button
                title="Generate Invite Code"
                onPress={handleGenerateInvite}
                loading={generateInvite.isPending}
                size="lg"
                style={{ marginTop: spacing.md }}
              />
            </>
          )}
        </Card>

        {/* Trip Members */}
        {trip && trip.members && trip.members.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>👥 Trip Members ({trip.members.length})</Text>
            {trip.members.map((member: any) => (
              <View key={member.userId} style={styles.memberRow}>
                <View style={[styles.memberAvatar, { backgroundColor: colors.primaryLight }]}>
                  <Text style={styles.memberInitial}>{member.user.name[0]?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{member.user.name}</Text>
                  <Text style={styles.memberEmail}>{member.user.email}</Text>
                </View>
                {member.role === 'organizer' && (
                  <Text style={styles.organizer}>Organizer</Text>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* Share Methods */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Share Invite</Text>
          <Text style={styles.helperText}>Share the invite code with your friends via:</Text>
          <View style={styles.shareGrid}>
            {[
              { name: 'Messages', icon: '💬' },
              { name: 'Email', icon: '📧' },
              { name: 'WhatsApp', icon: '💚' },
              { name: 'Social Media', icon: '🔗' },
            ].map((method) => (
              <View key={method.name} style={styles.shareMethod}>
                <Text style={styles.shareIcon}>{method.icon}</Text>
                <Text style={styles.shareLabel}>{method.name}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  back: { color: colors.primary, fontSize: 16, marginBottom: spacing.sm },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  helperText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  codeBox: { backgroundColor: colors.primaryLight, borderRadius: 12, paddingVertical: spacing.lg, paddingHorizontal: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  code: { fontSize: 24, fontWeight: '700', color: colors.primary, letterSpacing: 2 },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  memberInitial: { fontSize: 16, fontWeight: '700', color: colors.primary },
  memberName: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  memberEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  organizer: { fontSize: 11, color: colors.secondary, fontWeight: '600' },
  shareGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  shareMethod: { alignItems: 'center', width: '23%' },
  shareIcon: { fontSize: 28, marginBottom: spacing.xs },
  shareLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
});
