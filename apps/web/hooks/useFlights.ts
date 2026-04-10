import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useFlightSearch = (tripId: string, params: any, enabled = false) => useQuery({ queryKey: ['flights', 'search', tripId, params], queryFn: async () => (await api.get(`/trips/${tripId}/flights/search`, { params })).data, enabled, staleTime: 5 * 60 * 1000 });
export const useSavedFlights = (tripId: string) => useQuery({ queryKey: ['flights', 'saved', tripId], queryFn: async () => (await api.get(`/trips/${tripId}/flights/saved`)).data, enabled: !!tripId });
export const useSaveFlight = (tripId: string) => { const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => api.post(`/trips/${tripId}/flights/save`, data).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['flights', 'saved', tripId] }) }); };
export const useVoteFlight = (tripId: string) => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ optionId, value }: { optionId: string; value: 'UP' | 'DOWN' }) => api.post(`/trips/${tripId}/flights/${optionId}/vote`, { value }).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['flights', 'saved', tripId] }) }); };
