import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/stores/auth.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 60 * 1000 },
  },
});

function RootLayout() {
  const { loadFromStorage } = useAuthStore();
  useEffect(() => { loadFromStorage(); }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout />
    </QueryClientProvider>
  );
}
