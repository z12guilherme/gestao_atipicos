-- supabase/migrations/20240729120000_create_update_student_with_links_function.sql

CREATE OR REPLACE FUNCTION update_student_with_links(
    p_student_id UUID,
    p_student_data JSONB,
    p_guardian_ids UUID[],
    p_caregiver_ids UUID[]
)
RETURNS VOID AS $$
BEGIN
    -- 1. Atualiza os dados do estudante
    UPDATE public.students
    SET
        name = p_student_data->>'name',
        birth_date = (p_student_data->>'birth_date')::date,
        status = (p_student_data->>'status')::student_status,
        class_name = p_student_data->>'class_name',
        period = (p_student_data->>'period')::period_enum,
        diagnosis = p_student_data->>'diagnosis',
        medical_info = p_student_data->>'medical_info'
    WHERE id = p_student_id;

    -- 2. Gerencia os vínculos de responsáveis
    -- Remove os que não estão na nova lista
    DELETE FROM public.guardians_students
    WHERE student_id = p_student_id AND guardian_id NOT IN (SELECT unnest(p_guardian_ids));

    -- Adiciona os novos (ignorando os que já existem)
    INSERT INTO public.guardians_students (student_id, guardian_id, relationship)
    SELECT p_student_id, guardian_id, 'Responsável'
    FROM unnest(p_guardian_ids) AS guardian_id
    ON CONFLICT (student_id, guardian_id) DO NOTHING;

    -- 3. Gerencia os vínculos de cuidadores
    -- Remove os que não estão na nova lista
    DELETE FROM public.caregivers_students
    WHERE student_id = p_student_id AND caregiver_id NOT IN (SELECT unnest(p_caregiver_ids));

    -- Adiciona os novos (ignorando os que já existem)
    INSERT INTO public.caregivers_students (student_id, caregiver_id)
    SELECT p_student_id, caregiver_id
    FROM unnest(p_caregiver_ids) AS caregiver_id
    ON CONFLICT (student_id, caregiver_id) DO NOTHING;

END;
$$ LANGUAGE plpgsql;
