import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Tipos de perfil de usuário.
 */
export type UserRole = 'gestor' | 'cuidador' | 'responsavel' | 'professor';

/**
 * Interface para o perfil do usuário, correspondendo à tabela 'profiles' no Supabase.
 */
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  cpf?: string;
  phone?: string;
  role: UserRole;
  function_title?: string;
  work_schedule?: string;
}

/**
 * Hook para buscar o perfil do usuário autenticado.
 * 
 * Este hook utiliza o `useAuth` para obter o ID do usuário e, em seguida,
 * usa o `TanStack Query` para buscar e gerenciar o estado dos dados do perfil.
 * 
 * @returns Um objeto contendo:
 * - `profile`: Os dados do perfil do usuário ou `null` se não encontrado.
 * - `isLoading`: `true` enquanto o perfil está sendo carregado.
 * - `isError`: `true` se ocorreu um erro na busca.
 */
export function useProfile() {
  const { user } = useAuth();

  const { data: profile, isLoading, isError } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user, // A query só será executada se houver um usuário logado.
  });

  return { profile, isLoading, isError };
}