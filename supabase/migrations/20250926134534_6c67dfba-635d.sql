-- Adiciona os novos perfis 'root' e 'diretor' ao tipo user_role existente.
-- Este comando só será executado se os valores ainda não existirem.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'root' AND enumtypid = 'public.user_role'::regtype) THEN
    ALTER TYPE public.user_role ADD VALUE 'root' BEFORE 'gestor';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'diretor' AND enumtypid = 'public.user_role'::regtype) THEN
    ALTER TYPE public.user_role ADD VALUE 'diretor' BEFORE 'gestor';
  END IF;
END;
$$;


-- Função para buscar um perfil específico com seu e-mail.
CREATE OR REPLACE FUNCTION public.get_profiles_with_email(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    name text,
    email text,
    role public.user_role,
    cpf text,
    phone text,
    function_title text,
    work_schedule text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        p.id,
        p.user_id,
        p.name,
        u.email,
        p.role,
        p.cpf,
        p.phone,
        p.function_title,
        p.work_schedule
    FROM
        public.profiles p
    JOIN
        auth.users u ON p.user_id = u.id
    WHERE
        p.user_id = p_user_id;
$$;

-- Função para buscar TODOS os perfis com seus e-mails (útil para painéis de admin/gestor).
CREATE OR REPLACE FUNCTION public.get_all_profiles_with_email()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    name text,
    email text,
    role public.user_role,
    cpf text,
    phone text,
    function_title text,
    work_schedule text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        p.id,
        p.user_id,
        p.name,
        u.email,
        p.role,
        p.cpf,
        p.phone,
        p.function_title,
        p.work_schedule
    FROM
        public.profiles p
    JOIN
        auth.users u ON p.user_id = u.id;
$$;

-- Concede permissão de execução para os perfis que precisam acessar os dados.
-- Ajuste conforme necessário para sua lógica de segurança.
GRANT EXECUTE ON FUNCTION public.get_profiles_with_email(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_profiles_with_email() TO authenticated;

