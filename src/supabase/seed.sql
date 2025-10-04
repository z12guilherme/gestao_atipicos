-- supabase/seed.sql

-- Este script cria um usuário "root" (gestor) se ele ainda não existir, com a senha correta.
-- A senha está definida diretamente no script.
-- IMPORTANTE: Este método é adequado para desenvolvimento. Em produção,
-- considere criar o usuário administrador através do painel do Supabase.

-- 1. Cria o usuário de autenticação
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, is_sso_user)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'mguimarcos39@gmail.com',
  crypt('Mg156810$', gen_salt('bf')), -- Define a senha aqui
  now(), '', now(), null, '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', false
) ON CONFLICT (email) DO NOTHING;

-- 2. Cria o perfil associado ao usuário
INSERT INTO public.profiles (user_id, name, role)
SELECT id, 'Marcos Guilherme', 'gestor' FROM auth.users WHERE email = 'mguimarcos39@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
