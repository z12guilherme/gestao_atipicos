import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const responseHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: responseHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Valida o token do usuário que está fazendo a requisição
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requester }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !requester) {
      throw new Error("Acesso não autorizado.");
    }

    // 2. Verifica se o requisitante é um gestor
    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('role').eq('id', requester.id).single();
    if (profileError || profile?.role !== 'gestor') {
      throw new Error("Apenas gestores podem excluir usuários.");
    }

    // 3. Executa a exclusão
    const { userId } = await req.json();
    if (!userId) {
      throw new Error("ID do usuário a ser excluído não foi fornecido.");
    }

    if (userId === requester.id) {
      throw new Error("Um gestor não pode excluir a si mesmo.");
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw new Error(`Falha ao excluir usuário: ${deleteError.message}`);
    }

    return new Response(JSON.stringify({ message: "Usuário excluído com sucesso." }), { headers: responseHeaders, status: 200 });

  } catch (error) {
    console.error("Erro em delete-user:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { headers: responseHeaders, status: 500 });
  }
});