-- ========================================================================================
-- MIGRATION: 20260808000004_clear_mocks.sql
-- DESCRIÇÃO: Limpa os dados de teste (Lucas, etc) e prepara o banco para uso real em produção.
-- ========================================================================================

DELETE FROM public.medication_logs;
DELETE FROM public.medications;
DELETE FROM public.student_achievements;
DELETE FROM public.anecdotal_records;
DELETE FROM public.incidents;
DELETE FROM public.student_checkins;
DELETE FROM public.daily_health_logs;
DELETE FROM public.messages;
DELETE FROM public.announcements;
DELETE FROM public.pdi_goals;
DELETE FROM public.student_triggers;
DELETE FROM public.materials;
DELETE FROM public.meetings;
