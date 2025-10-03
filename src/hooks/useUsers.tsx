import { useQuery, useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  cpf?: string;
  phone?: string;
  role: 'gestor' | 'cuidador' | 'responsavel';
  function_title?: string;
  work_schedule?: string;
  email?: string; // Adicionado para consistência
  student_ids?: string[]; // Adicionado para carregar os estudantes vinculados
  user_id: string;
  created_at: string;
}

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, user_id(email)')
        .order('created_at', { ascending: false });

      if (error) throw new PostgrestError(error as any);
      return data?.map(p => ({ ...p, email: (p as any).user_id?.email })) as User[] || [];
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      name: string;
      cpf?: string;
      phone?: string;
      role: 'gestor' | 'cuidador' | 'responsavel';
      function_title?: string;
      work_schedule?: string;
      student_ids?: string[];
    }) => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Você precisa estar autenticado');
      }

      const response = await supabase.functions.invoke('create-user', {
        body: { records: [userData] }, // A Edge Function espera um array 'records'
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, profileData, student_ids }: { id: string, profileData: Partial<User>, student_ids?: string[] }) => {
      // 1. Atualiza os dados do perfil
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id)
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Se for um responsável, atualiza os estudantes vinculados na tabela de junção
      if (profileData.role === 'responsavel' && student_ids) {
        // Remove todas as associações existentes para este responsável
        const { error: deleteError } = await supabase
          .from('guardians_students')
          .delete()
          .eq('guardian_id', id);

        if (deleteError) throw deleteError;

        // Cria as novas associações
        if (student_ids.length > 0) {
          const newAssignments = student_ids.map(student_id => ({
            guardian_id: id,
            student_id,
            relationship: 'responsavel' // ou outro valor padrão
          }));
          const { error: insertError } = await supabase.from('guardians_students').insert(newAssignments);
          if (insertError) throw insertError;
        }
      }

      return updatedProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // A exclusão de um usuário do schema 'auth' requer privilégios de administrador,
      // então isso deve ser tratado por uma Supabase Edge Function.
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    },
  });

  return {
    users: users || [],
    isLoading,
    createUser,
    updateUser,
    deleteUser,
  };
}
