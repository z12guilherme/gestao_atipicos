import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

/**
 * Hook para buscar os dados específicos do painel de um cuidador (caregiver).
 */
export function useCaregiverData() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const { data: students, isLoading, error } = useQuery({
    queryKey: ['caregiverStudents', profile?.id],
    queryFn: async () => {
      if (!user || !profile) return [];

      // CORREÇÃO: A consulta agora é padronizada para usar o ID do perfil, assim como o hook do responsável.
      // Ela busca diretamente na tabela de junção e expande os dados dos estudantes.
      const { data: rawData, error } = await supabase
        .from('caregivers_students')
        .select('students(*)')
        .eq('caregiver_id', profile.id);

      if (error) {
        console.warn("Could not fetch caregiver data:", error.message);
        return [];
      }

      // Garante que 'students' seja sempre um array, mesmo que não haja estudantes vinculados.
      const studentList = (rawData || []).map((cs: any) => cs.students).filter(Boolean);
      return studentList;
    },
    enabled: !!user && !!profile,
  });

  return {
    students: students || [],
    isLoading,
    error,
  };
}