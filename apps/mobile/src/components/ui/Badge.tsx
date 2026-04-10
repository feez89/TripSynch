import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

export function Badge({ label, color = colors.primary, bg = colors.primaryLight }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  text: { fontSize: 11, fontWeight: '600' },
});
