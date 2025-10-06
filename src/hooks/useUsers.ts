import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'gestor' | 'cuidador' | 'responsavel';
  phone?: string | null;
  cpf?: string | null;
  // Campos específicos de cuidador
  function_title?: string | null;
  work_schedule?: string | null;
  // Campos específicos de responsável
  student_ids?: string[];
}

interface ProfileData {
  name: string;
  email: string;
  password?: string;
  role: 'gestor' | 'cuidador' | 'responsavel';
  phone?: string;
  cpf?: string;
  function_title?: string;
  work_schedule?: string;
}

interface CreateUserPayload extends ProfileData {
  student_ids?: string[];
}

interface UpdateUserPayload {
  id: string;
  profileData: Partial<ProfileData>;
  student_ids?: string[];
}

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // MELHORIA: A consulta agora busca os vínculos tanto de responsáveis quanto de cuidadores.
      // Isso garante que a UI tenha acesso a todos os vínculos, preparando para a nova aba.
      const { data, error } = await supabase.from('profiles')
        .select('*, guardians_students(student_id), caregivers_students(student_id)')
        .in('role', ['cuidador', 'responsavel'])
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as any[]; // Permite que o Supabase retorne a estrutura aninhada
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: CreateUserPayload) => {
      // CORREÇÃO: A função 'create-user' espera um array.
      // Envolvemos o objeto do usuário em um array.
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: [userData],
      });

      if (error) throw error;

      // A função retorna um resumo da importação, verificamos se houve erros.
      if (data.errorCount > 0) {
        throw new Error(data.errors[0]?.error || 'Falha ao criar usuário.');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Falha ao salvar usuário', {
        description: error.message,
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async (payload: UpdateUserPayload) => {
      const { id: userId, profileData } = payload;
      const student_ids = payload.student_ids || [];

      // 1. Atualiza os dados do perfil na tabela 'profiles'
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select('role') // Retorna o 'role' para a lógica condicional
        .single();

      if (profileError || !updatedProfile) throw profileError || new Error("Perfil não encontrado após atualização.");

      const userRole = updatedProfile.role;

      // 2. Lógica condicional para atualizar a tabela de vínculo correta
      if (userRole === 'cuidador') {
        // Remove vínculos antigos de cuidador
        await supabase.from('caregivers_students').delete().eq('caregiver_id', userId);
        // Insere novos vínculos se houver
        if (student_ids.length > 0) {
          const newAssignments = student_ids.map(studentId => ({ caregiver_id: userId, student_id: studentId }));
          const { error } = await supabase.from('caregivers_students').insert(newAssignments);
          if (error) throw error;
        }
      } else if (userRole === 'responsavel') {
        // Remove vínculos antigos de responsável
        await supabase.from('guardians_students').delete().eq('guardian_id', userId);
        // Insere novos vínculos se houver
        if (student_ids.length > 0) {
          const newAssignments = student_ids.map(studentId => ({
            guardian_id: userId,
            student_id: studentId,
            relationship: 'responsavel' // ou outro valor padrão
          }));
          const { error } = await supabase.from('guardians_students').insert(newAssignments);
          if (error) throw error;
        }
      }

      // Se a role não for nenhuma das duas, nenhuma ação de vínculo é necessária.
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
      const { error } = await supabase.functions.invoke('delete-user', { body: { userId } });
      if (error) throw error;
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