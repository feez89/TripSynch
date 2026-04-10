import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title, onPress, variant = 'primary', size = 'md', loading, disabled, style,
}: ButtonProps) {
  const bg =
    variant === 'primary' ? colors.primary :
    variant === 'danger' ? colors.danger :
    variant === 'secondary' ? colors.surface :
    'transparent';

  const textColor =
    variant === 'primary' ? '#fff' :
    variant === 'danger' ? '#fff' :
    variant === 'secondary' ? colors.textPrimary :
    colors.primary;

  const border = variant === 'secondary' ? { borderWidth: 1, borderColor: colors.border } : {};
  const pad = size === 'sm' ? { paddingVertical: 8, paddingHorizontal: 14 } :
              size === 'lg' ? { paddingVertical: 16, paddingHorizontal: 24 } :
              { paddingVertical: 12, paddingHorizontal: 20 };
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 17 : 15;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, { backgroundColor: bg, ...pad, ...border, opacity: disabled ? 0.5 : 1 }, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={{ color: textColor, fontWeight: '600', fontSize }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
