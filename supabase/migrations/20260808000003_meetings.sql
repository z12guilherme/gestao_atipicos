CREATE TABLE IF NOT EXISTS public.meetings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    participants text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    status text DEFAULT 'Confirmada',
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestores can manage all" ON public.meetings;
CREATE POLICY "Gestores can manage all" ON public.meetings USING (public.is_gestor() OR public.is_admin());

DO $$
BEGIN
    INSERT INTO public.meetings (title, participants, scheduled_at)
    VALUES ('Alinhamento de PDI - Lucas', 'Com: Psicóloga, TO e Mãe', now() + interval '2 days');
END $$;
