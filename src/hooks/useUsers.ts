import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface User {
  id: string; // ID do perfil (profile)
  user_id: string; // ID de autenticação (auth.users)
  name: string;
  email: string;
  role: 'gestor' | 'cuidador' | 'responsavel' | 'professor';
  phone?: string | null;
  cpf?: string | null;
  // Campos específicos de cuidador
  function_title?: string | null;
  work_schedule?: string | null;
  // Campos específicos de responsável
  student_ids?: string[];
  guardians_students?: { students: { id: string; name: string } }[];
  caregivers_students?: { students: { id: string; name: string } }[];
}

interface ProfileData {
  name: string;
  email?: string; // Email não é atualizável diretamente no perfil
  password?: string;
  role: 'gestor' | 'cuidador' | 'responsavel' | 'professor';
  phone?: string | null;
  cpf?: string;
  function_title?: string;
  work_schedule?: string;
}

interface CreateUserPayload extends ProfileData {
  student_ids?: string[];
}

interface UpdateUserPayload {
  id: string;
  profileData: Partial<Omit<ProfileData, 'email' | 'password'>>;
  student_ids?: string[];
}

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // CORREÇÃO: A consulta direta estava falhando devido a permissões de RLS
      // na tabela auth.users. Usar a função RPC 'get_all_users' resolve isso,
      // pois ela é executada com privilégios de administrador no servidor.
      const { data, error } = await supabase
  .from('profiles')
  .select(`
    id, user_id, name, role, phone, cpf, function_title, work_schedule,
    caregivers_students(student_id)
  `);

if (error) throw error;

return data.map((user: any) => ({
  ...user,
  student_ids: user.caregivers_students?.map((c: any) => c.student_id) || [],
}));

      if (error) throw error;

      // A função RPC já retorna os dados no formato que precisamos.
      // Apenas garantimos que o retorno seja um array.
      return (data as User[]) || [];
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
      const { id, profileData, student_ids } = payload;

      // Atualiza apenas os dados do perfil. A gestão de vínculos foi movida para StudentManagement.
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id);

      if (profileError) {
        throw profileError;
      }
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
