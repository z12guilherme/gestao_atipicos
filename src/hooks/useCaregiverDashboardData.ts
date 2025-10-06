import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { startOfToday, endOfToday } from 'date-fns';

export interface RecentNote {
  id: string;
  student_name: string; // Este campo não existe na tabela 'reports', precisaremos de um join.
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
      // CORREÇÃO: A tabela se chama 'reports', não 'notes'.
      const { data: notes, error: notesError } = await supabase
        .from('reports')
        .select('id, content, created_at, students(name)') // Faz um JOIN para buscar o nome do estudante
        .eq('caregiver_id', user.id)
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
        // Mapeia o resultado para o formato esperado pelo componente
        recentNotes: (notes?.map(n => ({
          id: n.id,
          student_name: (n.students as any)?.name || 'Estudante não encontrado',
          note: n.content,
          created_at: n.created_at,
        })) as RecentNote[]) || [],
        todayScheduleCount: scheduleCount || 0,
      };
    },
    enabled: !!user,
  });
}