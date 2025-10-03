import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export function useReports(studentId?: string) {
  const queryClient = useQueryClient();
  const queryKey = studentId ? ['reports', studentId] : ['reports'];

  const { data: reports, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select('*, students(name), profiles!inner(name)')
        .order('report_date', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Report[];
    },
    enabled: !!studentId, // A query só será executada se um studentId for fornecido
  });

  const createReport = useMutation({
    mutationFn: async (reportData: Omit<Report, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Relatório criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar relatório: ${error.message}`);
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, ...reportData }: Partial<Report> & { id: string }) => {
      const { data, error } = await supabase
        .from('reports')
        .update(reportData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Relatório atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar relatório: ${error.message}`);
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Relatório excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir relatório: ${error.message}`);
    },
  });

  return {
    reports: reports || [],
    isLoading,
    createReport,
    updateReport,
    deleteReport,
  };
}