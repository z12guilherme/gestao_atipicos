import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Hook para buscar os dados específicos do painel de um responsável (guardian).
 * 
 * Ele busca o perfil do usuário logado e, se for um responsável,
 * carrega a lista de estudantes vinculados a ele com todos os seus detalhes.
 */
export function useGuardianData() {
  const { user } = useAuth();

  const { data: guardianData, isLoading, error } = useQuery({
    // A chave da query inclui o ID do usuário para garantir que os dados sejam
    // recarregados se o usuário mudar.
    queryKey: ['guardianData', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // A consulta busca o perfil do responsável
      // e, se existirem, os estudantes vinculados. Se não houver estudantes,
      // a consulta não falha, retornando o perfil com uma lista vazia de estudantes.
      const { data, error } = await supabase
        .from('profiles')
        .select('*, guardians_students(students(*))')
        .eq('user_id', user.id)
        .limit(1) // Garante que apenas um perfil seja retornado
        .single();

      if (error) {
        // Se o .single() falhar (ex: usuário não é responsável), o erro é capturado.
        // Retornar null em vez de lançar o erro evita que a aplicação quebre.
        console.warn(`[useGuardianData] Could not fetch data for user ${user.id}: ${error.message}`);
        return null; // Retorna null para que a UI possa tratar o estado de "sem dados".
      }
      return data;
    },
    // A query só será executada se houver um usuário logado.
    enabled: !!user,
  });

  return {
    guardianData,
    // CORREÇÃO: Garante que 'students' seja sempre um array.
    // 1. Usa optional chaining `?.` para acessar 'guardians_students' de forma segura.
    // 2. O `|| []` garante que, se 'guardians_students' for undefined, o map opere sobre um array vazio.
    // 3. O `filter(Boolean)` remove quaisquer entradas nulas ou indefinidas resultantes do map.
    students: (guardianData?.guardians_students || []).map(gs => gs.students).filter(Boolean),
    isLoading,
    error,
  };
}