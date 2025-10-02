import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  cpf?: string;
  phone?: string;
  role: 'gestor' | 'cuidador' | 'responsavel';
  function_title?: string;
  work_schedule?: string;
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
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
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
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Você precisa estar autenticado');
      }

      const response = await supabase.functions.invoke('create-user', {
        body: userData,
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
    mutationFn: async ({ id, ...userData }: Partial<User> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    },
  });

  return {
    users: users || [],
    isLoading,
    createUser,
    updateUser,
  };
}