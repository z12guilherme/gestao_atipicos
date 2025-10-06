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
      const { data, error } = await supabase
        .from('profiles')
        // CORREÇÃO: Busca os perfis e, para cada um, os IDs dos estudantes vinculados.
        // Otimiza a consulta para trazer apenas cuidadores e responsáveis.
        .select('*, guardians_students(student_id)')
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
      // A atualização pode ser feita diretamente via RPC ou API padrão se não houver lógica complexa.
      // Por enquanto, vamos assumir uma chamada direta.
      const { error } = await supabase.from('profiles').update(payload.profileData).eq('id', payload.id);
      if (error) throw error;
      // Lógica para atualizar 'guardians_students' se necessário
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