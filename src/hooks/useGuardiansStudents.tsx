import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useGuardiansStudents() {
  const queryClient = useQueryClient();

  const assignStudentsToGuardian = useMutation({
    mutationFn: async ({ guardianId, studentIds, relationship }: { 
      guardianId: string; 
      studentIds: string[];
      relationship: string;
    }) => {
      const assignments = studentIds.map((studentId, index) => ({
        guardian_id: guardianId,
        student_id: studentId,
        relationship,
        is_primary: index === 0, // O primeiro é o responsável principal
      }));

      const { data, error } = await supabase
        .from('guardians_students')
        .insert(assignments)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians_students'] });
      toast.success('Alunos vinculados ao responsável com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao vincular alunos: ${error.message}`);
    },
  });

  return {
    assignStudentsToGuardian,
  };
}
