
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from './useProfile';
import { toast } from "sonner";

export interface Schedule {
  id: string;
  student_id: string;
  caregiver_id: string | null;
  activity: string;
  start_time: string;
  end_time?: string;
  date: string;
}

export const useSchedules = (studentId: string, date: Date) => {
  const { user } = useAuth(); // Provides the auth user
  const { profile } = useProfile(); // Provides the application profile
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = useCallback(async () => {
    if (!user || !studentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('student_id', studentId)
        .eq('date', date.toISOString().split('T')[0]);

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  }, [user, studentId, date]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const addSchedule = async (newSchedule: Omit<Schedule, 'id' | 'caregiver_id'> & { caregiver_id?: string | null }) => {
    if (!user || !profile) return;
    try {
      const caregiverIdToUse = newSchedule.caregiver_id !== undefined ? newSchedule.caregiver_id : profile.id;
      // Log para confirmar qual ID está sendo usado na tentativa de agendamento
      console.log("Tentando agendar. User ID (Auth):", user.id, "Profile ID:", profile.id, "Caregiver ID enviado:", caregiverIdToUse);

      const { data, error } = await supabase
        .from('schedules')
        .insert([{ ...newSchedule, caregiver_id: caregiverIdToUse }])
        .select();

      if (error) throw error;
      if (data) {
        setSchedules((prev) => [...prev, ...data]);
        toast.success("Atividade agendada com sucesso!");
      }
    } catch (error: any) {
      console.error('Error adding schedule:', error);
      // Verifica se é erro de conflito (409) ou violação de unicidade (23505)
      if (error.code === '23505' || error.code === '23P01' || error.status === 409 || error.message?.includes('duplicate key')) {
        toast.error("Já existe uma atividade neste horário para este estudante.");
      } else if (error.code === '42501' || error.status === 403) {
        toast.error("Permissão negada. Verifique se você está logado corretamente.");
      } else if (error.code === '23503') {
        toast.error("Erro de vínculo: O Cuidador informado não é válido ou não possui perfil.");
      } else {
        toast.error(`Erro ao agendar: ${error.message || "Erro desconhecido"}`);
      }
    }
  };

  const removeSchedule = async (id: string) => {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      toast.success("Atividade removida.");
    } catch (error) {
      console.error('Error removing schedule:', error);
      toast.error("Erro ao remover atividade.");
    }
  };

  return { schedules, loading, fetchSchedules, addSchedule, removeSchedule };
};
