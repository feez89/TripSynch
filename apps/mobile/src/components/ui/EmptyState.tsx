import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '✈️', title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && <View style={{ marginTop: spacing.md }}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  icon: { fontSize: 48, marginBottom: spacing.md },
  title: { ...typography.h3, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.small, textAlign: 'center', lineHeight: 20 },
});
