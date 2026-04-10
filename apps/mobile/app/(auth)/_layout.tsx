import { Stack } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth.store';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (!isLoading && isAuthenticated) return <Redirect href="/(app)/trips" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
