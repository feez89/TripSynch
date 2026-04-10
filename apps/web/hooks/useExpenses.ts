import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useExpenses = (tripId: string) => useQuery({ queryKey: ['expenses', tripId], queryFn: async () => (await api.get(`/trips/${tripId}/expenses`)).data, enabled: !!tripId });
export const useSettlements = (tripId: string) => useQuery({ queryKey: ['settlements', tripId], queryFn: async () => (await api.get(`/trips/${tripId}/settlements`)).data, enabled: !!tripId });
export const useCreateExpense = (tripId: string) => { const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => api.post(`/trips/${tripId}/expenses`, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses', tripId] }); qc.invalidateQueries({ queryKey: ['settlements', tripId] }); } }); };
