import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
export const useGeneratePlan = (tripId: string) => { const qc = useQueryClient(); return useMutation({ mutationFn: (brief: any) => api.post(`/trips/${tripId}/plan`, brief).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }) }); };
