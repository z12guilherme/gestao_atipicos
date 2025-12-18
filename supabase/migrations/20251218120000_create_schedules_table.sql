
-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the schedules table
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schedules
-- Gestores can manage all schedules
CREATE POLICY "Gestores can manage all schedules" ON public.schedules
  FOR ALL USING (public.is_gestor());

-- Cuidadores can manage schedules for assigned students
CREATE POLICY "Cuidadores can manage schedules for assigned students" ON public.schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.caregivers_students cs
      JOIN public.profiles p ON p.id = cs.caregiver_id
      WHERE cs.student_id = schedules.student_id 
      AND p.user_id = auth.uid()
      AND p.role = 'cuidador'
    )
  );

-- Responsaveis can view schedules for their students
CREATE POLICY "Responsaveis can view schedules for their students" ON public.schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guardians_students gs
      JOIN public.profiles p ON p.id = gs.guardian_id
      WHERE gs.student_id = schedules.student_id 
      AND p.user_id = auth.uid()
      AND p.role = 'responsavel'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
