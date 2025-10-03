import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Lida com a requisição pre-flight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Cria um cliente Supabase com privilégios de administrador
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 2. Verifica se a requisição vem de um gestor autenticado
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      throw new Error("Acesso não autorizado. Token inválido.");
    }

    // 3. Confirma se o usuário autenticado tem o perfil 'gestor'
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id) // A coluna de ID no profiles deve ser 'id'
      .single()

    if (profileError || profile?.role !== 'gestor') {
      throw new Error("Apenas gestores podem criar novos usuários.");
    }

    // 4. Extrai os dados do novo usuário do corpo da requisição
    const { email, password, name, role, ...rest } = await req.json()

    if (!email || !password || !name || !role) {
      throw new Error("Campos 'email', 'password', 'name' e 'role' são obrigatórios.");
    }

    // 5. Cria o usuário no serviço de autenticação
    const { data: authData, error: authUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authUserError) throw authUserError;
    if (!authData.user) throw new Error("Falha ao criar usuário na autenticação.");

    // 6. Insere o perfil correspondente na tabela 'profiles'
    const { error: createProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id, // Garante que o ID do perfil seja o mesmo do usuário
        name,
        role,
        email,
        ...rest
      });

    if (createProfileError) {
      // Rollback: se a criação do perfil falhar, deleta o usuário da autenticação
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw createProfileError;
    }

    return new Response(
      JSON.stringify({ message: "Usuário criado com sucesso!" }),
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    )
  }
});