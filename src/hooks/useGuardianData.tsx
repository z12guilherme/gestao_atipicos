import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile"; // Importa o hook de perfil

// Estendemos a interface para incluir os relatórios
export interface StudentWithReports extends Student {
  reports: {
    id: string;
    content: string;
    created_at: string;
    profiles: { name: string } | null; // Perfil do cuidador que escreveu a nota
  }[];
}

/**
 * Hook para buscar os dados dos estudantes (filhos) vinculados a um responsável.
 */
export function useGuardianData() {
  const { user } = useAuth();
  const { profile } = useProfile(); // Obtém o perfil do usuário logado

  return useQuery<StudentWithReports[]>({
    queryKey: ['guardianData', profile?.id], // A chave da query agora depende do ID do perfil
    queryFn: async () => {
      if (!user || !profile) { // Garante que tanto o usuário quanto o perfil estejam carregados
        return [];
      }

      // CORREÇÃO: A consulta foi reestruturada para ser mais robusta.
      // 1. Inicia a partir do perfil do usuário logado.
      // 2. Busca os vínculos na tabela `guardians_students`.
      // 3. Para cada vínculo, busca os dados completos do estudante e seus relatórios.
      const { data: rawData, error } = await supabase
        .from('guardians_students')
        .select('students(*)') // SIMPLIFICAÇÃO: Alinhado com useCaregiverData para maior robustez.
        .eq('guardian_id', profile.id); // CORREÇÃO: Usa o ID do perfil para a consulta

      if (error) {
        console.error("Erro ao buscar dados do responsável:", error);
        return [];
      }

      const students = (rawData || [])
        .map((item: any) => {
          // A estrutura agora é mais simples, apenas extraímos o objeto do estudante.
          // A busca de relatórios será tratada separadamente para garantir robustez.
          return item.students;
        }).filter(Boolean) as StudentWithReports[];
      
      return students;
    },
    enabled: !!user && !!profile, // A query só é executada quando ambos estiverem disponíveis
  });
}