import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Report {
  id: string;
  student_id: string;
  caregiver_id: string;
  title: string;
  content: string;
  report_date: string;
  created_at: string;
  updated_at: string;
  // Campos opcionais para joins
  students?: { name: string };
  profiles?: { name: string };
}

export function useStudentReports(studentId?: string) {
  const queryKey = studentId ? ['reports', studentId] : ['reports'];

  const { data: reports, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('reports')
        .select('*, profiles!inner(name)')
        .eq('student_id', studentId)
        .order('report_date', { ascending: false });

      if (error) throw error;
      return data as Report[];
    },
    enabled: !!studentId, // A query só será executada se um studentId for fornecido
  });

  return {
    reports: reports || [],
    isLoading,
  };
}
