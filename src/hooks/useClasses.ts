import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Class {
  id: string;
  name: string;
  created_at: string;
}

export interface ClassFormData {
  name: string;
}

const fetchClasses = async (): Promise<Class[]> => {
  const { data, error } = await supabase.from('classes').select('*').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

export function useClasses() {
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading, isError } = useQuery<Class[]>({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  });

  const createClass = useMutation({
    mutationFn: async (newClass: ClassFormData) => {
      const { data, error } = await supabase.from('classes').insert(newClass).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Turma criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Falha ao criar turma', { description: error.message });
    },
  });

  const updateClass = useMutation({
    mutationFn: async ({ id, ...updatedData }: { id: string } & Partial<ClassFormData>) => {
      const { data, error } = await supabase.from('classes').update(updatedData).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Turma atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Falha ao atualizar turma', { description: error.message });
    },
  });

  const deleteClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Turma excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Falha ao excluir turma', { description: error.message });
    },
  });

  return { classes, isLoading, isError, createClass, updateClass, deleteClass };
}