import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export interface Student {
  id: string;
  name: string;
  birth_date: string;
  status: 'ativo' | 'inativo' | 'aguardando';
  class_name?: string;
  period?: 'Manhã' | 'Tarde' | 'Integral';
  diagnosis?: string;
  medical_info?: string; // CORREÇÃO: Nome do campo alinhado com o banco de dados
  created_at: string;
  caregivers_students?: any[];
  guardians_students?: any[];
  caregiver_ids?: string[]; // Adicionado para o formulário
  guardian_ids?: string[]; // Adicionado para o formulário
}

const studentSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  status: z.enum(['ativo', 'inativo', 'aguardando']),
  // Adicione outras validações conforme necessário
});

export function useStudents() {
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      // 🔍 Fetch students along with their current caregiver and guardian links
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          caregivers_students:caregivers_students ( caregiver:profiles (id, name) ),
          guardians_students:guardians_students ( guardian:profiles (id, name) )
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      // Filtra estudantes que não possuem cuidadores ou responsáveis vinculados.
      const noCaregiver = data.filter(s => !s.caregivers_students || s.caregivers_students.length === 0);
      const noGuardian = data.filter(s => !s.guardians_students || s.guardians_students.length === 0);

      return {
        all: data as Student[],
        noCaregiver: noCaregiver as Student[],
        noGuardian: noGuardian as Student[],
      };
    },
  });

  // --- MUTATION: criar estudante ---
  const createStudent = useMutation({
    mutationFn: async (studentData: Partial<Student>) => {
      const { data, error } = await supabase.from('students').insert(studentData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Estudante criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar estudante: ${error.message}`);
    },
  });

  // --- MUTATION: atualizar estudante ---
  const updateStudent = useMutation({
    mutationFn: async (studentData: Partial<Student> & { id: string }) => {
      const { id, ...updateData } = studentData;
      const { error } = await supabase.from('students').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Estudante atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar estudante: ${error.message}`);
    },
  });

  // --- MUTATION: deletar estudante ---
  const deleteStudent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('students').delete().eq('id', id);
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
    students: students?.all || [],
    studentsWithoutCaregiver: students?.noCaregiver || [],
    studentsWithoutGuardian: students?.noGuardian || [],
    isLoading,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}