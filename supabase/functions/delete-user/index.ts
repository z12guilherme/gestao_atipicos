// supabase/functions/delete-user/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../../cors.ts';

console.log("Função delete-user inicializada.");

Deno.serve(async (req) => {
  // O navegador envia uma requisição OPTIONS primeiro para verificar o CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("O ID do usuário (userId) é obrigatório.");
    }

    // Cria um cliente Supabase com privilégios de administrador para poder excluir um usuário
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Exclui o usuário do serviço de autenticação da Supabase
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Erro ao deletar usuário no Supabase Auth:', error.message);
      throw error;
    }

    console.log(`Usuário com ID ${userId} excluído com sucesso.`);

    return new Response(JSON.stringify({ message: 'Usuário excluído com sucesso!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na Edge Function delete-user:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
 
