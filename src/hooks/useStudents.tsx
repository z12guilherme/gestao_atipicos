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
          caregivers_students ( caregiver_id ),
          guardians_students ( guardian_id )
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      // 🔍 Separate students who don't have a caregiver or guardian
      const noCaregiver = data.filter(s => !s.caregivers_students || s.caregivers_students.length === 0);
      const noGuardian = data.filter(s => !s.guardians_students || s.guardians_students.length === 0);

      return {
        all: data as Student[],
        noCaregiver: noCaregiver as Student[],
        noGuardian: noGuardian as Student[],
      };
    },
  });

  // --- MUTATION: criar/atualizar estudante e seus vínculos ---
  const upsertStudent = useMutation({
    mutationFn: async (studentData: Partial<Student> & { id?: string }) => {
      const { caregiver_ids, guardian_ids, ...studentInfo } = studentData;

      // 1. Cria ou atualiza o estudante
      const { data: savedStudent, error: studentError } = await supabase
        .from('students')
        .upsert(studentInfo)
        .select()
        .single();

      if (studentError) throw studentError;
      if (!savedStudent) throw new Error("Falha ao salvar estudante.");

      const studentId = savedStudent.id;

      // 2. Atualiza os vínculos de cuidadores (se fornecido)
      if (caregiver_ids !== undefined) {
        await supabase.from('caregivers_students').delete().eq('student_id', studentId);
        if (caregiver_ids.length > 0) {
          const caregiverAssignments = caregiver_ids.map(caregiver_id => ({ student_id: studentId, caregiver_id }));
          const { error: caregiverError } = await supabase.from('caregivers_students').insert(caregiverAssignments);
          if (caregiverError) throw caregiverError;
        }
      }

      // 3. Atualiza os vínculos de responsáveis (se fornecido)
      if (guardian_ids !== undefined) {
        await supabase.from('guardians_students').delete().eq('student_id', studentId);
        if (guardian_ids.length > 0) {
          const guardianAssignments = guardian_ids.map(guardian_id => ({
            student_id: studentId,
            guardian_id: guardian_id,
            relationship: 'Responsável', // CORREÇÃO: Adiciona o campo obrigatório
          }));
          const { error: guardianError } = await supabase.from('guardians_students').insert(guardianAssignments);
          if (guardianError) throw guardianError;
        }
      }

      return savedStudent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalida usuários para atualizar a lista de vínculos
      toast.success('Estudante e seus vínculos foram salvos com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar estudante: ${error.message}`);
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
    upsertStudent,
    deleteStudent,
  };
}