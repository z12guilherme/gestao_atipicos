import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Student } from "./useStudents";

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
        .select('*, students(*)') // CORREÇÃO: Busca todos os dados do estudante vinculado
        .eq('guardian_id', user.id);

      if (error) {
        console.error("Erro ao buscar dados do responsável:", error);
        return { students: [] };
      }

      // Extrai apenas os dados dos estudantes da resposta, que vêm aninhados.
      const students = data.map(item => item.students).filter(Boolean) as Student[];
      return { students };
    },
    enabled: !!user,
  });
}