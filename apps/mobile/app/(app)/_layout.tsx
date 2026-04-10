import { Tabs } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth.store';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (!isLoading && !isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="trips"
        options={{ title: 'Trips', tabBarIcon: ({ color, size }) => <Ionicons name="airplane-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
