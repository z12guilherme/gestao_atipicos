import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Report { // Mantendo a interface consistente
  id: string;
  content: string;
  created_at: string;
  caregiver_name?: string; // Nome do cuidador que fez o relatório
}

/**
 * Hook para buscar os relatórios (observações) de um estudante específico.
 *
 * @param studentId O ID do estudante cujos relatórios devem ser buscados.
 */
export function useStudentReports(studentId?: string) {
  const { data, isLoading } = useQuery<Report[]>({
    queryKey: ['studentReports', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      // Busca relatórios e faz um JOIN com a tabela 'profiles' para obter o nome do cuidador.
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          content,
          created_at,
          profiles ( name )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Mapeia os dados para o formato esperado, extraindo o nome do cuidador.
      return data.map(report => ({ ...report, caregiver_name: (report.profiles as any)?.name || 'Cuidador' })) as Report[];
    },
    enabled: !!studentId, // A query só será executada se um studentId for fornecido
  });

  return {
    reports: data || [],
    isLoading,
  };
}
