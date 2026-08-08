import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSecurity() {
  const queryClient = useQueryClient();

  const { data: checkins, isLoading: loadingCheckins } = useQuery({
    queryKey: ['checkins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_checkins')
        .select(`
          id,
          checkin_time,
          checkout_time,
          notes,
          students (name),
          authorized_persons (name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: incidents, isLoading: loadingIncidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          id,
          severity,
          description,
          resolved,
          created_at,
          students (name),
          profiles (name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  return {
    checkins,
    loadingCheckins,
    incidents,
    loadingIncidents,
  };
}
