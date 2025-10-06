import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface User {
  id: string;
  user_id: string;
  name: string;
  cpf?: string;
  phone?: string;
  role: 'gestor' | 'cuidador' | 'responsavel';
  function_title?: string;
  work_schedule?: string;
  email?: string;
  student_ids?: string[];
  created_at: string;
}

export function useUsers() {
  const queryClient = useQueryClient();

  // --- QUERY: busca todos os usuários com email ---
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // CORREÇÃO: A query foi simplificada para buscar os dados aninhados
      // e retorná-los diretamente, sem o processamento que estava causando o bug.
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          caregivers_students ( students ( id, name ) ),
          guardians_students ( students ( id, name ) )
        `)
        .in('role', ['cuidador', 'responsavel'])
        .order('name', { ascending: true });
      
      if (error) throw new Error(error.message);
      return (data as any[]) || [];
    },
  });

  // --- MUTATION: criar usuário ---
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
        // CORREÇÃO: Adiciona o token de autenticação no cabeçalho da requisição.
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
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
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: user_id }) }); // CORREÇÃO: Envia o corpo como uma string JSON
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
