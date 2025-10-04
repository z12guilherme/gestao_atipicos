import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { Student } from './useStudents';

interface GuardianStudent {
  students: Student;
}

/**
 * Hook para buscar os estudantes vinculados a um perfil de 'responsavel'.
 *
 * @returns Um objeto contendo:
 * - `guardianStudents`: Um array de estudantes vinculados ao responsável.
 * - `isLoading`: `true` enquanto os dados dos estudantes estão sendo carregados.
 * - `isError`: `true` se ocorreu um erro na busca.
 */
export function useGuardianStudents() {
  const { profile } = useProfile();

  const { data: guardianStudents, isLoading, isError } = useQuery<Student[]>({
    queryKey: ['guardianStudents', profile?.id],
    queryFn: async () => {
      if (!profile || profile.role !== 'responsavel') {
        return [];
      }

      const { data, error } = await supabase
        .from('guardians_students')
        .select('students:student_id(*)') // Realiza o join com a tabela 'students'
        .eq('guardian_id', profile.id);

      if (error) throw new Error(error.message);

      return (data as GuardianStudent[] | null)?.map(item => item.students).filter(Boolean) as Student[] || [];
    },
    enabled: !!profile && profile.role === 'responsavel', // A query só executa se houver um perfil de responsável.
  });

  return { guardianStudents: guardianStudents ?? [], isLoading, isError };
}