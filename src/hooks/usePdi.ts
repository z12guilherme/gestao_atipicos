import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePdi() {
  const { data: records, isLoading: loadingRecords } = useQuery({
    queryKey: ['anecdotal_records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anecdotal_records')
        .select(`
          *,
          students (name),
          profiles (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: achievements, isLoading: loadingAchievements } = useQuery({
    queryKey: ['student_achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_achievements')
        .select(`
          *,
          students (name)
        `)
        .order('achieved_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: goals, isLoading: loadingGoals } = useQuery({
    queryKey: ['pdi_goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pdi_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: triggers, isLoading: loadingTriggers } = useQuery({
    queryKey: ['student_triggers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_triggers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  return {
    records,
    loadingRecords,
    achievements,
    loadingAchievements,
    goals,
    loadingGoals,
    triggers,
    loadingTriggers
  };
}
