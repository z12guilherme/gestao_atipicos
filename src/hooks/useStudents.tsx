import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Student {
  id: string;
  name: string;
  cpf?: string;
  birth_date?: string;
  class_name?: string;
  school_year?: string;
  diagnosis?: string;
  special_needs?: string;
  medical_info?: string;
  status: 'ativo' | 'inativo' | 'transferido';
  created_at: string;
  updated_at: string;
}

export function useStudents() {
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Student[];
    },
  });

  const createStudent = useMutation({
    mutationFn: async (studentData: {
      name: string;
      cpf?: string;
      birth_date?: string;
      class_name?: string;
      school_year?: string;
      diagnosis?: string;
      special_needs?: string;
      medical_info?: string;
      status: 'ativo' | 'inativo' | 'transferido';
    }) => {
      const { data, error } = await supabase
        .from('students')
        .insert(studentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Estudante cadastrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao cadastrar estudante: ${error.message}`);
    },
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, ...studentData }: Partial<Student> & { id: string }) => {
      const { data, error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Estudante atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar estudante: ${error.message}`);
    },
  });

  const deleteStudent = useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Estudante excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir estudante: ${error.message}`);
    },
  });

  return {
    students: students || [],
    isLoading,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}