import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Hook para buscar os dados específicos do painel de um cuidador (caregiver).
 * 
 * Ele busca o perfil do usuário logado e, se for um cuidador,
 * carrega a lista de estudantes vinculados a ele com todos os seus detalhes.
 */
export function useCaregiverData() {
  const { user } = useAuth();

  const { data: caregiverData, isLoading, error } = useQuery({
    queryKey: ['caregiverData', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // A consulta busca o perfil e expande os dados dos estudantes vinculados.
      // 'caregivers_students(students(*))' faz um JOIN para buscar
      // os detalhes completos (*) da tabela 'students'.
      const { data, error } = await supabase
        .from('profiles')
        .select('*, caregivers_students(students(*))')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn("Could not fetch caregiver data:", error.message);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });

  return {
    caregiverData,
    // Garante que 'students' seja sempre um array, mesmo que não haja estudantes vinculados.
    students: (caregiverData?.caregivers_students || []).map((cs: any) => cs.students).filter(Boolean),
    isLoading,
    error,
  };
}