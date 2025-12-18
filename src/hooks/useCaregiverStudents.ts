
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Student } from '@/hooks/useStudents.tsx';

export const useCaregiverStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('caregivers_students')
        .select('students(*)')
        .eq('caregiver_id', profile.id);

      if (error) throw error;
      
      const studentData = data?.map(item => item.students).filter(Boolean) as Student[] || [];
      setStudents(studentData);
    } catch (error) {
      console.error('Error fetching caregiver students:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading };
};
