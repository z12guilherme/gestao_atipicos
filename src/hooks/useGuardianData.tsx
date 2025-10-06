import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Estendemos a interface para incluir os relatórios
export interface StudentWithReports extends Student {
  reports: {
    id: string;
    content: string;
    created_at: string;
    profiles: { name: string } | null; // Perfil do cuidador que escreveu a nota
  }[];
}

interface GuardianData {
  students: Student[];
}

/**
 * Hook para buscar os dados dos estudantes (filhos) vinculados a um responsável.
 */
export function useGuardianData() {
  const { user } = useAuth();

  return useQuery<GuardianData>({
    queryKey: ['guardianData', user?.id],
    queryFn: async () => {
      if (!user) {
        return { students: [] };
      }

      const { data, error } = await supabase
        .from('guardians_students')
        // MELHORIA: Busca os estudantes e, para cada um, seus relatórios e o nome do cuidador que o escreveu.
        .select('*, students(*, reports(*, profiles:caregiver_id(name)))')
        .eq('guardian_id', user.id);

      if (error) {
        console.error("Erro ao buscar dados do responsável:", error);
        return { students: [] };
      }

      // Extrai e formata os dados dos estudantes da resposta, que vêm aninhados.
      // Ordena os relatórios por data, do mais recente para o mais antigo.
      const students = data.map(item => ({ ...item.students, reports: item.students.reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) })).filter(Boolean) as StudentWithReports[];
      return { students };
    },
    enabled: !!user,
  });
}