-- ========================================================================================
-- MIGRATION: 20260808000001_mock_data.sql
-- DESCRIÇÃO: Insere dados falsos nas novas tabelas (PDI, Saúde, Comunicação, Segurança)
--            para popular a interface com dados reais do Supabase.
-- ========================================================================================

-- NOTA: Como não sabemos os IDs exatos dos alunos e perfis, vamos fazer um bloco anonimo PL/pgSQL
-- para pegar o primeiro aluno e primeiro perfil e usá-los.

DO $$
DECLARE
    v_student_id uuid;
    v_profile_id uuid;
    v_medication_id uuid;
    v_announcement_id uuid;
BEGIN
    -- Pegar o primeiro aluno existente
    SELECT id INTO v_student_id FROM public.students LIMIT 1;
    
    -- Pegar o primeiro perfil existente (Provavelmente o gestor/professor)
    SELECT id INTO v_profile_id FROM public.profiles LIMIT 1;

    -- Se tiver aluno e perfil, insere os dados
    IF v_student_id IS NOT NULL AND v_profile_id IS NOT NULL THEN
    
        -- 1. SEGURANÇA (Check-ins)
        INSERT INTO public.student_checkins (student_id, checkin_time, logged_by, notes)
        VALUES (v_student_id, now() - interval '4 hours', v_profile_id, 'Chegou animado');

        INSERT INTO public.incidents (student_id, reporter_id, severity, description, action_taken, resolved)
        VALUES (v_student_id, v_profile_id, 'media', 'Crise de choro ao trocar de sala', 'Contenção no cantinho da calma', true);

        -- 2. PDI (Anedotário e Conquistas)
        INSERT INTO public.anecdotal_records (student_id, author_id, title, content)
        VALUES 
            (v_student_id, v_profile_id, 'Uso do PECS', 'O aluno conseguiu pedir água apontando para a ficha correta de forma independente pela primeira vez.'),
            (v_student_id, v_profile_id, 'Socialização', 'Dividiu o brinquedo com o colega durante o intervalo sem mediação.');

        INSERT INTO public.student_achievements (student_id, title, description, badge_icon)
        VALUES 
            (v_student_id, 'Super Simpático', 'Deu bom dia para 3 colegas diferentes', 'smile'),
            (v_student_id, 'Herói da Calma', 'Respirou fundo durante uma frustração', 'award');

        -- 3. SAÚDE (Medicação e Diário)
        INSERT INTO public.medications (student_id, name, dosage, schedule, instructions)
        VALUES (v_student_id, 'Risperidona', '1mg', '10:00 AM', 'Dar com suco ou água')
        RETURNING id INTO v_medication_id;

        INSERT INTO public.medication_logs (medication_id, administered_by, notes)
        VALUES (v_medication_id, v_profile_id, 'Tudo certo');

        INSERT INTO public.daily_health_logs (student_id, log_date, sleep_quality, parents_notes, meal_quality, bathroom_notes, school_notes)
        VALUES (v_student_id, CURRENT_DATE, 'Boa', 'Dormiu a noite toda', 'Regular', 'Fez xixi 2x', 'Aceitou apenas arroz no almoço');

        -- 4. COMUNICAÇÃO (Mural e Chat)
        INSERT INTO public.messages (sender_id, receiver_id, student_id, content)
        VALUES 
            (v_profile_id, v_profile_id, v_student_id, 'Olá! Como foi a noite dele?'),
            (v_profile_id, v_profile_id, v_student_id, 'Foi ótima, dormiu bem. Ele está levando a lancheira azul hoje.');

        INSERT INTO public.announcements (title, content, author_id, requires_signature)
        VALUES ('Passeio ao Parque Ecológico', 'Iremos ao parque na próxima sexta-feira. Por favor, assinem a autorização.', v_profile_id, true)
        RETURNING id INTO v_announcement_id;

    END IF;
END $$;
