import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Professor {
  id: string;
  user_id: string;
  subject: string;
  created_at: string;
  updated_at: string;
  // Campos opcionais para joins
  name?: string;
  email?: string;
}

export function useProfessors() {
  const queryClient = useQueryClient();
  const queryKey = ['professors'];

  const { data: professors, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      // Chama a função RPC para buscar os dados de forma segura e eficiente
      const { data, error } = await supabase.rpc('get_professors_with_details');
      
      if (error) throw error;
      return data as Professor[];
    },
  });

  const createProfessor = useMutation({
    mutationFn: async (professorData: Omit<Professor, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('professors')
        .insert(professorData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Professor cadastrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao cadastrar professor: ${error.message}`);
    },
  });

  const updateProfessor = useMutation({
    mutationFn: async ({ id, ...professorData }: Partial<Professor> & { id: string }) => {
      const { data, error } = await supabase
        .from('professors')
        .update(professorData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Professor atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar professor: ${error.message}`);
    },
  });

  const deleteProfessor = useMutation({
    mutationFn: async (professorId: string) => {
      const { error } = await supabase
        .from('professors')
        .delete()
        .eq('id', professorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Professor excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir professor: ${error.message}`);
    },
  });

  return {
    professors: professors || [],
    isLoading,
    createProfessor,
    updateProfessor,
    deleteProfessor,
  };
}