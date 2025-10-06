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
      // CORREÇÃO: A consulta agora busca os detalhes dos estudantes aninhados.
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          caregivers_students!inner(students(id, name)),
          guardians_students!inner(students(id, name))
        `)
        .in('role', ['cuidador', 'responsavel', 'professor', 'gestor'])
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
    mutationFn: async ({ id, profileData, student_ids }: { id: string, profileData: Partial<User>, student_ids?: string[] }) => {
      // 1️⃣ Atualiza os dados do perfil
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id)
        .select()
        .single();

      if (profileError) throw profileError;

      // 2️⃣ Se for responsável, atualiza estudantes vinculados
      if (profileData.role === 'responsavel' && student_ids) {
        // Remove associações antigas
        const { error: deleteError } = await supabase
          .from('guardians_students')
          .delete()
          .eq('guardian_id', id); // CORREÇÃO: Usar o ID do perfil
        if (deleteError) throw deleteError;

        // Cria novas associações
        if (student_ids.length > 0) {
          const newAssignments = student_ids.map(student_id => ({
            guardian_id: id, // CORREÇÃO: Usar o ID do perfil
            student_id,
            relationship: 'responsavel'
          }));
          const { error: insertError } = await supabase.from('guardians_students').insert(newAssignments);
          if (insertError) throw insertError;
        }
      }

      // 3️⃣ Se for cuidador, atualiza estudantes vinculados
      if (profileData.role === 'cuidador' && student_ids) {
        // Remove associações antigas
        const { error: deleteError } = await supabase
          .from('caregivers_students')
          .delete()
          .eq('caregiver_id', id); // CORREÇÃO: Usar o ID do perfil
        if (deleteError) throw deleteError;

        // Cria novas associações
        if (student_ids.length > 0) {
          const newAssignments = student_ids.map(student_id => ({
            caregiver_id: id, // CORREÇÃO: Usar o ID do perfil
            student_id,
            relationship: 'cuidador'
          }));
          const { error: insertError } = await supabase.from('caregivers_students').insert(newAssignments);
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

  return {
    users: users || [],
    isLoading,
    createUser,
    updateUser,
    deleteUser,
  };
}
