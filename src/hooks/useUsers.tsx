import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  email?: string;
  student_ids?: string[];
  user_id: string;
  created_at: string;
}

export function useUsers() {
  const queryClient = useQueryClient();

  // ==============================
  // FETCH USERS
  // ==============================
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          auth_user: user_id (
            email
          )
        `) // join correto com auth.users
        .order('created_at', { ascending: false });

      if (error) throw new PostgrestError(error as any);

      return data?.map(p => ({
        ...p,
        email: (p as any).auth_user?.email || ''
      })) as User[] || [];
    },
  });

  // ==============================
  // CREATE USER
  // ==============================
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

      if (!session) throw new Error('Você precisa estar autenticado');

      const response = await supabase.functions.invoke('create-user', {
        body: { records: [userData] },
      });

      if (response.error) throw new Error(response.error.message);

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

  // ==============================
  // UPDATE USER
  // ==============================
  const updateUser = useMutation({
    mutationFn: async ({ id, profileData, student_ids }: { id: string, profileData: Partial<User>, student_ids?: string[] }) => {
      // Atualiza dados do perfil
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id)
        .select()
        .single();

      if (profileError) throw profileError;

      // Atualiza estudantes vinculados se for responsável
      if (profileData.role === 'responsavel' && student_ids) {
        const { error: deleteError } = await supabase
          .from('guardians_students')
          .delete()
          .eq('guardian_id', id);
        if (deleteError) throw deleteError;

        if (student_ids.length > 0) {
          const newAssignments = student_ids.map(student_id => ({
            guardian_id: id,
            student_id,
            relationship: 'responsavel',
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

  // ==============================
  // DELETE USER
  // ==============================
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });
      if (error) throw new Error(error.message);
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
