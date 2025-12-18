import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Define the CORS headers required for the browser to allow the request.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allows any origin
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Specifies allowed methods
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // This is the crucial part: it handles the preflight OPTIONS request.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validação das variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase environment variables.');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    const jwt = authHeader.replace('Bearer ', '');

    // 2. Validação do Token JWT (Autenticação)
    const supabaseAuthClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { auth: { persistSession: false } }
    );

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(jwt);
    if (authError) {
      console.error("Auth Error:", authError);
      throw new Error(`Unauthorized: ${authError.message}`);
    }
    if (!user) {
      throw new Error('Unauthorized: User not found.');
    }

    // 3. Inicialização do Cliente Admin (Service Role)
    // Usamos este cliente para operações privilegiadas e para ler o perfil sem restrições de RLS
    const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 4. Verificação de Autorização (Role = 'gestor')
    // Usamos o Admin Client para garantir que conseguimos ler o perfil independente das RLS
    const { data: profile, error: profileError } = await supabaseAdminClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError);
    }

    if (profileError || profile?.role !== 'gestor') {
      console.error("Acesso negado. Role encontrada:", profile?.role);
      return new Response(JSON.stringify({ error: 'Forbidden: User is not a manager.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // 5. Processamento e validação do corpo da requisição
    const body = await req.json();
    const { id, guardian_ids, caregiver_ids, ...studentData } = body;

    if (!studentData.name) throw new Error('Nome do estudante é obrigatório');
    if (guardian_ids && !Array.isArray(guardian_ids)) throw new Error('guardian_ids deve ser um array');
    if (caregiver_ids && !Array.isArray(caregiver_ids)) throw new Error('caregiver_ids deve ser um array');

    const upsertPayload = { ...studentData };
    if (id) upsertPayload.id = id;

    // 6. Execução das operações no banco de dados com o cliente admin
    const { data: studentResult, error: studentError } = await supabaseAdminClient
      .from('students')
      .upsert(upsertPayload)
      .select()
      .single();

    if (studentError) {
      console.error("Supabase Student Upsert Error:", studentError);
      throw studentError;
    }
    const studentId = studentResult.id;

    // 7. Gerenciamento transacional dos relacionamentos
    if (Array.isArray(guardian_ids)) {
      const { error: deleteError } = await supabaseAdminClient.from('guardians_students').delete().eq('student_id', studentId);
      if (deleteError) throw deleteError;

      if (guardian_ids.length > 0) {
        const guardianInserts = guardian_ids.map((gid: string) => ({ student_id: studentId, guardian_id: gid, relationship: 'Responsável' }));
        const { error: relError } = await supabaseAdminClient.from('guardians_students').insert(guardianInserts);
        if (relError) {
          console.error("Error inserting guardians:", relError);
          throw relError;
        }
      }
    }

    if (Array.isArray(caregiver_ids)) {
      const { error: deleteError } = await supabaseAdminClient.from('caregivers_students').delete().eq('student_id', studentId);
      if (deleteError) throw deleteError;

      if (caregiver_ids.length > 0) {
        const caregiverInserts = caregiver_ids.map((cid: string) => ({ student_id: studentId, caregiver_id: cid }));
        const { error: relError } = await supabaseAdminClient.from('caregivers_students').insert(caregiverInserts);
        if (relError) {
          console.error("Error inserting caregivers:", relError);
          throw relError;
        }
      }
    }

    return new Response(JSON.stringify({ id: studentId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('🔥 Error in upsert-student function:', err);
    return new Response(JSON.stringify({
      error: err.message,
      stack: err.stack,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
