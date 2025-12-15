import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface User {
  id: string;
  user_id: string;
  name: string;
  email?: string; // agora incluído
  cpf?: string;
  phone?: string;
  role: 'gestor' | 'cuidador' | 'responsavel';
  function_title?: string;
  work_schedule?: string;
  student_ids?: string[];
  caregivers_students?: { students: { id: string; name: string } }[];
  guardians_students?: { students: { id: string; name: string } }[];
  created_at: string;
}

export function useUsers() {
  const queryClient = useQueryClient();

  // --- QUERY: busca todos os usuários com email e vínculos ---
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Chama a RPC 'get_all_users' que retorna profiles + email do auth.users
      const { data, error } = await supabase.rpc('get_all_users');
      if (error) throw new Error(error.message);

      return data as User[];
    },
  });

  // --- MUTATION: criar usuário ---
  const createUser = useMutation({
    mutationFn: async (userData: Partial<User> & { email: string; password: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Você precisa estar autenticado');

      const response = await supabase.functions.invoke('create-user', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: [userData],
      });

      if (response.error) throw new Error(response.error.message);
      
      const { errorCount, errors } = response.data;
      if (errorCount > 0 && errors?.length > 0) {
        throw new Error(errors[0].error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    },
  });

  // --- MUTATION: atualizar usuário ---
  const updateUser = useMutation({
    mutationFn: async ({ id, profileData }: { id: string, profileData: Partial<User> }) => {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    },
  });

  // --- MUTATION: deletar usuário ---
  const deleteUser = useMutation({
    mutationFn: async (user_id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Você precisa estar autenticado');

      const { error } = await supabase.functions.invoke('delete-user', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ userId: user_id }),
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

  // --- MUTATION: enviar email de redefinição de senha ---
  const sendPasswordReset = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
    },
    onSuccess: (data, email) => {
      toast.success(`E-mail de redefinição enviado para ${email}`);
    },
    onError: (error: any) => {
      toast.error(`Falha ao enviar e-mail: ${error.message}`);
    },
  });

  return {
    users: users || [],
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    sendPasswordReset,
  };
}
