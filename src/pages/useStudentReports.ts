import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Report } from './useGuardianData'; // Reutiliza a tipagem se já existir

/**
 * Busca os relatórios (reports) para um estudante específico.
 * @param studentId O ID do estudante.
 */
const fetchStudentReports = async (studentId: string): Promise<Report[]> => {
  if (!studentId) return [];

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

  if (error) throw new Error(error.message);

  return data || [];
};

export function useStudentReports(studentId: string) {
  return useQuery({
    queryKey: ['studentReports', studentId],
    queryFn: () => fetchStudentReports(studentId),
    enabled: !!studentId, // A query só será executada se studentId for fornecido
  });
}