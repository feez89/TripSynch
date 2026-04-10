import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../src/stores/auth.store';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { colors, spacing, typography } from '../../src/constants/theme';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type Form = z.infer<typeof schema>;

export default function SignInScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      router.replace('/(app)/trips');
    } catch (e: any) {
      Alert.alert('Sign in failed', e.response?.data?.error || 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>✈️ TripSync</Text>
          <Text style={styles.tagline}>Plan, compare, book, split.</Text>
        </View>

        <View style={styles.form}>
          <Text style={typography.h2}>Welcome back</Text>
          <Text style={[typography.small, { marginBottom: spacing.lg }]}>Sign in to your account</Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Email"
                placeholder="you@example.com"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Password"
                placeholder="Your password"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" style={{ marginTop: spacing.sm }} />

          <TouchableOpacity style={styles.link} onPress={() => router.push('/(auth)/sign-up')}>
            <Text style={styles.linkText}>Don't have an account? <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign up</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => router.push('/(auth)/join')}>
            <Text style={styles.linkText}>Have an invite code? <Text style={{ color: colors.primary, fontWeight: '600' }}>Join a trip</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.lg },
  header: { alignItems: 'center', paddingVertical: spacing.xxl },
  logo: { fontSize: 36, fontWeight: '800', color: colors.primary },
  tagline: { fontSize: 16, color: colors.textSecondary, marginTop: spacing.xs },
  form: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg },
  link: { marginTop: spacing.md, alignItems: 'center' },
  linkText: { fontSize: 14, color: colors.textSecondary },
});
