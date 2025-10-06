import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { startOfToday, endOfToday } from 'date-fns';

export interface RecentNote {
  id: string;
  student_name: string;
  note: string;
  created_at: string;
}

/**
 * Hook para buscar dados agregados para o dashboard do cuidador.
 * 
 * - Busca observações recentes (do dia atual).
 * - Conta o número de atividades na agenda para o dia atual.
 */
export function useCaregiverDashboardData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['caregiverDashboardData', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const todayStart = startOfToday().toISOString();
      const todayEnd = endOfToday().toISOString();

      // 1. Buscar observações do dia criadas pelo cuidador
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('id, student_name, note, created_at')
        .eq('user_id', user.id)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd)
        .order('created_at', { ascending: false });

      // 2. Contar atividades na agenda do dia
      const { count: scheduleCount, error: scheduleError } = await supabase
        .from('schedules')
        .select('*', { count: 'exact', head: true })
        .eq('caregiver_id', user.id)
        .gte('start_time', todayStart)
        .lte('start_time', todayEnd);

      if (notesError || scheduleError) {
        console.error("Erro ao buscar dados do dashboard:", notesError || scheduleError);
        return { recentNotes: [], todayScheduleCount: 0 };
      }

      return {
        recentNotes: (notes as RecentNote[]) || [],
        todayScheduleCount: scheduleCount || 0,
      };
    },
    enabled: !!user,
  });
}