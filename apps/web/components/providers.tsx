'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 2, staleTime: 60000 } } });

function AuthLoader({ children }: { children: React.ReactNode }) {
  const { loadUser } = useAuthStore();
  useEffect(() => { loadUser(); }, []);
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthLoader>{children}</AuthLoader>
    </QueryClientProvider>
  );
}
