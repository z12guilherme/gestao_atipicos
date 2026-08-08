import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useHealth() {
  const queryClient = useQueryClient();

  const { data: healthLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['daily_health_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_health_logs')
        .select(`
          *,
          students (name)
        `)
        .order('log_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: medications, isLoading: loadingMedications } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medications')
        .select(`
          *,
          students (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const administerMedication = useMutation({
    mutationFn: async ({ medId, profileId, notes }: { medId: string, profileId: string, notes?: string }) => {
      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          medication_id: medId,
          administered_by: profileId,
          notes
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Medicação administrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao administrar medicação: ' + error.message);
    }
  });

  return {
    healthLogs,
    loadingLogs,
    medications,
    loadingMedications,
    administerMedication
  };
}
