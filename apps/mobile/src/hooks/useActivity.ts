import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useActivity = (tripId: string) =>
  useQuery({
    queryKey: ['activity', tripId],
    queryFn: async () => (await api.get(`/trips/${tripId}/activity`)).data,
    enabled: !!tripId,
    refetchInterval: 30000,
  });
