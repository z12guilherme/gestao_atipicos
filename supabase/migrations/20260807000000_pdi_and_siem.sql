-- 20260807000000_pdi_and_siem.sql

-- ============================================================
-- 1. PDI (Plano de Desenvolvimento Individual)
-- ============================================================

CREATE TYPE public.pdi_status AS ENUM ('pendente', 'em_andamento', 'concluida');

CREATE TABLE IF NOT EXISTS public.student_pdi (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status public.pdi_status DEFAULT 'pendente'::public.pdi_status NOT NULL,
    target_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pdi_evaluations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    pdi_id uuid NOT NULL REFERENCES public.student_pdi(id) ON DELETE CASCADE,
    evaluator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notes text NOT NULL,
    progress_score integer CHECK (progress_score >= 1 AND progress_score <= 5),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER update_student_pdi_updated_at BEFORE UPDATE ON public.student_pdi FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.student_pdi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdi_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS for student_pdi
CREATE POLICY "Gestores can manage all student_pdi" ON public.student_pdi USING (public.is_gestor() OR public.is_admin());

CREATE POLICY "Cuidadores can view pdi for assigned students" ON public.student_pdi FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.caregivers_students cs
        JOIN public.profiles p ON p.id = cs.caregiver_id
        WHERE cs.student_id = student_pdi.student_id AND p.user_id = auth.uid() AND p.role = 'cuidador'::public.user_role
    )
);

CREATE POLICY "Responsáveis can view pdi for their students" ON public.student_pdi FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.guardians_students gs
        JOIN public.profiles p ON p.id = gs.guardian_id
        WHERE gs.student_id = student_pdi.student_id AND p.user_id = auth.uid() AND p.role = 'responsavel'::public.user_role
    )
);

-- RLS for pdi_evaluations
CREATE POLICY "Gestores can manage all pdi_evaluations" ON public.pdi_evaluations USING (public.is_gestor() OR public.is_admin());

CREATE POLICY "Cuidadores can view evaluations for assigned students" ON public.pdi_evaluations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.student_pdi pdi
        JOIN public.caregivers_students cs ON cs.student_id = pdi.student_id
        JOIN public.profiles p ON p.id = cs.caregiver_id
        WHERE pdi.id = pdi_evaluations.pdi_id AND p.user_id = auth.uid() AND p.role = 'cuidador'::public.user_role
    )
);

CREATE POLICY "Responsáveis can view evaluations for their students" ON public.pdi_evaluations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.student_pdi pdi
        JOIN public.guardians_students gs ON gs.student_id = pdi.student_id
        JOIN public.profiles p ON p.id = gs.guardian_id
        WHERE pdi.id = pdi_evaluations.pdi_id AND p.user_id = auth.uid() AND p.role = 'responsavel'::public.user_role
    )
);

CREATE POLICY "Cuidadores can insert evaluations for assigned students" ON public.pdi_evaluations FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.student_pdi pdi
        JOIN public.caregivers_students cs ON cs.student_id = pdi.student_id
        JOIN public.profiles p ON p.id = cs.caregiver_id
        WHERE pdi.id = pdi_evaluations.pdi_id AND p.user_id = auth.uid() AND p.role = 'cuidador'::public.user_role
    )
);


-- ============================================================
-- 2. SIEM (Security Logs)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.security_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores can view security_logs" ON public.security_logs FOR SELECT USING (public.is_gestor() OR public.is_admin());

-- Allow insert from authenticated users (can be tightened later, but needed for frontend telemetry)
CREATE POLICY "Authenticated can insert security_logs" ON public.security_logs FOR INSERT TO authenticated WITH CHECK (true);
