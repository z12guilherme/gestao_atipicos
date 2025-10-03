import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Class {
  id: string;
  name: string;
  created_at: string;
}

export function useClasses() {
  const queryClient = useQueryClient();
  const queryKey = ['classes'];

  const { data: classes, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Class[];
    },
  });

  const createClass = useMutation({
    mutationFn: async (classData: Pick<Class, 'name'>) => {
      const { data, error } = await supabase
        .from('classes')
        .insert(classData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Turma criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar turma: ${error.message}`);
    },
  });

  return {
    classes: classes || [],
    isLoading,
    createClass,
    // Futuras mutações (update, delete) podem ser adicionadas aqui.
  };
}