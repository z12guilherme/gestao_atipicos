-- ========================================================================================
-- MIGRATION: 20260808000002_more_real_data.sql
-- DESCRIÇÃO: Criação das tabelas restantes para eliminar dados estáticos do frontend.
--            (Metas PDI, Gatilhos e Materiais).
-- ========================================================================================

CREATE TABLE IF NOT EXISTS public.pdi_goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title text NOT NULL,
    progress_percentage integer DEFAULT 0,
    color text DEFAULT 'violet',
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_triggers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    insight_text text NOT NULL,
    suggestion_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.materials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    type text NOT NULL, -- 'pdf', 'video'
    size_mb numeric,
    url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Policies
ALTER TABLE public.pdi_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestores can manage all" ON public.pdi_goals;
CREATE POLICY "Gestores can manage all" ON public.pdi_goals USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.student_triggers;
CREATE POLICY "Gestores can manage all" ON public.student_triggers USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.materials;
CREATE POLICY "Gestores can manage all" ON public.materials USING (public.is_gestor() OR public.is_admin());

-- Mock Data Injection
DO $$
DECLARE
    v_student_id uuid;
BEGIN
    SELECT id INTO v_student_id FROM public.students LIMIT 1;
    
    IF v_student_id IS NOT NULL THEN
        -- PDI Goals
        INSERT INTO public.pdi_goals (student_id, title, progress_percentage, color)
        VALUES 
            (v_student_id, 'Habilidade Motora Fina', 75, 'violet'),
            (v_student_id, 'Comunicação Alternativa (PECS)', 90, 'emerald'),
            (v_student_id, 'Interação Social Direcionada', 40, 'amber');

        -- Triggers
        INSERT INTO public.student_triggers (student_id, insight_text, suggestion_text)
        VALUES (
            v_student_id, 
            'Notamos que em 80% das vezes que a qualidade do sono é relatada como "Agitada", ocorre uma "Crise de Regulação" entre 09:30 e 10:30.',
            'Ao identificar noites de sono ruins, antecipar o horário do lanche e focar em atividades de baixa demanda sensorial na primeira aula.'
        );

        -- Materials
        INSERT INTO public.materials (title, type, size_mb)
        VALUES 
            ('Cartilha de Regulação', 'pdf', 2.4),
            ('Vídeo: Uso de PECS', 'video', 15.0);
    END IF;
END $$;
