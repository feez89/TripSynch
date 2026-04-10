import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useAuthStore } from '../../src/stores/auth.store';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  const appVersion = Constants.manifest?.version || '1.0.0';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={typography.h1}>Profile</Text>
        </View>

        {/* User Card */}
        {user && (
          <Card style={styles.card}>
            <View style={styles.userSection}>
              <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Account Settings */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{user?.email}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Full Name</Text>
              <Text style={styles.settingValue}>{user?.name}</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* App Info */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{appVersion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>1.0</Text>
          </View>
        </Card>

        {/* Help & Support */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.link}>📖 Documentation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.link}>💬 Feedback</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.link}>🐛 Report a Bug</Text>
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          size="lg"
          style={{ margin: spacing.md, marginTop: spacing.xl }}
        />

        {/* Terms */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.footerSeparator}>•</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.md },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  userSection: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.primary },
  userName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  userEmail: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  settingRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  settingLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  settingValue: { fontSize: 14, color: colors.textPrimary, marginTop: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 14, color: colors.textPrimary },
  infoValue: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  linkRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  link: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  footerLink: { fontSize: 12, color: colors.textMuted },
  footerSeparator: { fontSize: 12, color: colors.border },
});
