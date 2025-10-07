import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Report {
  id: string;
  student_id: string;
  content: string;
  created_at: string;
  caregiver_name: string;
}

/**
 * Hook para buscar todos os relatórios (observações).
 * É usado pelo painel do responsável para exibir o histórico completo.
 */
export function useReportsData() {
  const { user } = useAuth();

  return useQuery<Report[]>({
    queryKey: ['allReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('id, student_id, content, created_at, caregiver:profiles!caregiver_id(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(report => ({
        ...report,
        caregiver_name: (report.caregiver as any)?.name || 'Cuidador'
      })) as Report[];
    },
    enabled: !!user,
  });
}