import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useTrips = () => useQuery({ queryKey: ['trips'], queryFn: async () => (await api.get('/trips')).data });
export const useTrip = (tripId: string) => useQuery({ queryKey: ['trips', tripId], queryFn: async () => (await api.get(`/trips/${tripId}`)).data, enabled: !!tripId });
export const useCreateTrip = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => api.post('/trips', data).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }) }); };
export const useJoinTrip = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (code: string) => api.post('/trips/join', { inviteCode: code }).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }) }); };
export const useGenerateInvite = (tripId: string) => useMutation({ mutationFn: () => api.post(`/trips/${tripId}/invite`).then(r => r.data) });
