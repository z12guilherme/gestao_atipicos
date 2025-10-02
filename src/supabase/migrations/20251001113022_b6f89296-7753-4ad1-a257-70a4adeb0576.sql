-- Criar perfis para usuários existentes que ainda não têm perfil
INSERT INTO public.profiles (user_id, name, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  'responsavel'::user_role
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;