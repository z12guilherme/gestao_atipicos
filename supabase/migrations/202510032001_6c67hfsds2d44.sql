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


-- Remove a função antiga para evitar conflitos de assinatura
DROP FUNCTION IF EXISTS public.get_profile_with_email();
-- Função para buscar um perfil específico com seu e-mail.
CREATE OR REPLACE FUNCTION public.get_profile_with_email() -- Remove o parâmetro
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
        p.user_id = auth.uid(); -- Usa o ID do usuário autenticado
$$;

-- Remove a função antiga para evitar conflitos de assinatura
DROP FUNCTION IF EXISTS public.get_profiles_with_email();
-- Função para buscar TODOS os perfis com seus e-mails (útil para painéis de admin/gestor).
CREATE OR REPLACE FUNCTION public.get_profiles_with_email()
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
        p.role <> 'root'; -- Exclui o usuário root da listagem
$$;

-- Concede permissão de execução para os perfis que precisam acessar os dados.
GRANT EXECUTE ON FUNCTION public.get_profile_with_email() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profiles_with_email() TO authenticated;
