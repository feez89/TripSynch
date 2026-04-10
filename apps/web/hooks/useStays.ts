import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useStaySearch = (tripId: string, params: any, enabled = false) => useQuery({ queryKey: ['stays', 'search', tripId, params], queryFn: async () => (await api.get(`/trips/${tripId}/stays/search`, { params })).data, enabled, staleTime: 5 * 60 * 1000 });
export const useSavedStays = (tripId: string) => useQuery({ queryKey: ['stays', 'saved', tripId], queryFn: async () => (await api.get(`/trips/${tripId}/stays/saved`)).data, enabled: !!tripId });
export const useSaveStay = (tripId: string) => { const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => api.post(`/trips/${tripId}/stays/save`, data).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['stays', 'saved', tripId] }) }); };
export const useVoteStay = (tripId: string) => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ optionId, value }: { optionId: string; value: 'UP' | 'DOWN' }) => api.post(`/trips/${tripId}/stays/${optionId}/vote`, { value }).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['stays', 'saved', tripId] }) }); };
