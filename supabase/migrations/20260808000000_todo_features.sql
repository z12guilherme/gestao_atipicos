-- ========================================================================================
-- MIGRATION: 20260808000000_todo_features.sql
-- DESCRIÇÃO: Criação das tabelas para as funcionalidades de Segurança, PDI avançado,
--            Saúde, e Comunicação do TODO.md.
-- ========================================================================================

-- ==========================================
-- 1. SEGURANÇA E MONITORAMENTO
-- ==========================================

-- Pessoas autorizadas a buscar o aluno
CREATE TABLE IF NOT EXISTS public.authorized_persons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    name text NOT NULL,
    relationship text NOT NULL, -- Ex: Tio, Avó, Motorista
    doc_id text NOT NULL, -- CPF ou RG
    photo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Registro de Entrada e Saída (Check-in/Check-out)
CREATE TABLE IF NOT EXISTS public.student_checkins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    authorized_person_id uuid REFERENCES public.authorized_persons(id) ON DELETE SET NULL,
    checkin_time timestamp with time zone,
    checkout_time timestamp with time zone,
    logged_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- Profissional que registrou
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Incidentes (Botão de Pânico / Crises / Acidentes)
CREATE TABLE IF NOT EXISTS public.incidents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    severity text NOT NULL CHECK (severity IN ('baixa', 'media', 'alta', 'emergencia')),
    description text NOT NULL,
    action_taken text,
    resolved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- 2. RELATÓRIOS E PDI AVANÇADO
-- ==========================================

-- Diário de Bordo / Anedotário
CREATE TABLE IF NOT EXISTS public.anecdotal_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    media_url text, -- Opcional: foto/video curto ou áudio
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Conquistas (Gamificação)
CREATE TABLE IF NOT EXISTS public.student_achievements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    badge_icon text, -- Ex: 'star', 'trophy'
    achieved_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- 3. SAÚDE E BEM-ESTAR
-- ==========================================

-- Prescrições/Medicações do Aluno
CREATE TABLE IF NOT EXISTS public.medications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    name text NOT NULL,
    dosage text NOT NULL,
    schedule text NOT NULL, -- Ex: "Às 10h e 14h"
    instructions text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Log de Administração da Medicação
CREATE TABLE IF NOT EXISTS public.medication_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id uuid NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
    administered_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    administered_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text
);

-- Diário de Saúde (Sono, Alimentação) - Preenchido parte pela família, parte pela escola
CREATE TABLE IF NOT EXISTS public.daily_health_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    log_date date DEFAULT CURRENT_DATE NOT NULL,
    -- Preenchido pela família de manhã
    sleep_quality text, 
    morning_mood text,
    parents_notes text,
    -- Preenchido pela escola à tarde
    meal_quality text,
    bathroom_notes text,
    school_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- 4. COMUNICAÇÃO FAMÍLIA-ESCOLA
-- ==========================================

-- Chat seguro
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE, -- Contexto do chat
    content text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Murais / Comunicados da Escola
CREATE TABLE IF NOT EXISTS public.announcements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    requires_signature boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Assinaturas de Comunicados (Ex: Autorização de passeio)
CREATE TABLE IF NOT EXISTS public.announcement_signatures (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    guardian_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    signed_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- CONFIGURAÇÕES DE RLS (SEGURANÇA BASICA)
-- (Pode ser ajustado conforme a lógica fina de negócios, 
-- por padrão permitindo Gestores tudo, e acesso restrito aos cuidadores/pais)
-- ==========================================

ALTER TABLE public.authorized_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anecdotal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_signatures ENABLE ROW LEVEL SECURITY;

-- Políticas de Admin/Gestor (Tem acesso total a todas as tabelas)
DROP POLICY IF EXISTS "Gestores can manage all" ON public.authorized_persons;
CREATE POLICY "Gestores can manage all" ON public.authorized_persons USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.student_checkins;
CREATE POLICY "Gestores can manage all" ON public.student_checkins USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.incidents;
CREATE POLICY "Gestores can manage all" ON public.incidents USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.anecdotal_records;
CREATE POLICY "Gestores can manage all" ON public.anecdotal_records USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.student_achievements;
CREATE POLICY "Gestores can manage all" ON public.student_achievements USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.medications;
CREATE POLICY "Gestores can manage all" ON public.medications USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.medication_logs;
CREATE POLICY "Gestores can manage all" ON public.medication_logs USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.daily_health_logs;
CREATE POLICY "Gestores can manage all" ON public.daily_health_logs USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.messages;
CREATE POLICY "Gestores can manage all" ON public.messages USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.announcements;
CREATE POLICY "Gestores can manage all" ON public.announcements USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.announcement_signatures;
CREATE POLICY "Gestores can manage all" ON public.announcement_signatures USING (public.is_gestor() OR public.is_admin());
