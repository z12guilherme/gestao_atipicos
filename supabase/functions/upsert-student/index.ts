import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função auxiliar para gerenciar os vínculos de forma transacional
async function manageLinks(supabase: SupabaseClient, tableName: string, studentId: string, entityIds: string[], studentKey: string, entityKey: string, extraData: any = {}) {
  console.log(`[manageLinks] Iniciando para a tabela: ${tableName}`);

  // Deleta os vínculos existentes para o estudante
  console.log(`[manageLinks] Deletando vínculos antigos para studentId: ${studentId}`);
  const { error: deleteError } = await supabase.from(tableName).delete().eq(studentKey, studentId);
  if (deleteError) {
    console.error(`[manageLinks] Erro ao deletar da tabela ${tableName}:`, deleteError);
    throw deleteError;
  }
  console.log(`[manageLinks] Vínculos antigos deletados com sucesso da tabela ${tableName}.`);

  // Se houver novos IDs, insere os novos vínculos
  if (entityIds && Array.isArray(entityIds) && entityIds.length > 0) {
    // Remove duplicatas para evitar erros de violação de unicidade no banco
    const uniqueIds = [...new Set(entityIds)];
    
    const inserts = uniqueIds.map(id => ({ [studentKey]: studentId, [entityKey]: id, ...extraData }));
    console.log(`[manageLinks] Inserindo novos vínculos na tabela ${tableName}:`, JSON.stringify(inserts));
    const { error: insertError } = await supabase.from(tableName).insert(inserts);
    if (insertError) {
      console.error(`[manageLinks] Erro ao inserir na tabela ${tableName}:`, insertError);
      throw insertError;
    }
    console.log(`[manageLinks] Novos vínculos inseridos com sucesso na tabela ${tableName}.`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Usa a chave de serviço (service_role) para operações administrativas que precisam bypassar o RLS
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) {
      throw new Error('Erro de configuração: SUPABASE_SERVICE_ROLE_KEY não definida.');
    }

    const serviceRoleClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Cria um cliente com o contexto de autenticação do usuário para verificar seu perfil
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // 1. Autentica e autoriza o usuário
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado.');
    }
    
    const { data: profile } = await userClient.from('profiles').select('role').eq('user_id', user.id).limit(1).single();
    if (!profile || profile.role !== 'gestor') {
      throw new Error('Apenas gestores podem realizar esta operação.');
    }
    
    // 2. Processa o corpo da requisição
    const body = await req.json();
    const { id, guardian_ids, caregiver_ids, ...studentData } = body;
    let studentId = id;
    console.log(`Gerenciando estudante ${id}. Payload:`, JSON.stringify(body));

    // Apenas executa o upsert na tabela de estudantes se houver dados do perfil para atualizar.
    // Verificamos a presença de um campo obrigatório como 'name' para decidir se é uma atualização de perfil.
    if (studentData.name) {
      // 3. Cria ou atualiza os dados do estudante
      const { data: studentResult, error: studentError } = await serviceRoleClient
        .from('students')
        .upsert({ id: id, ...studentData })
        .select('id')
        .single();
        
      if (studentError) throw studentError;
      studentId = studentResult.id;
    }
    
    if (!studentId) {
      throw new Error('O ID do estudante é necessário para gerenciar os vínculos.');
    }
    
    // 4. Gerencia os vínculos
    if (guardian_ids !== undefined) {
      await manageLinks(serviceRoleClient, 'guardians_students', studentId, guardian_ids, 'student_id', 'guardian_id', { relationship: 'Responsável' });
    }
    
    if (caregiver_ids !== undefined) {
      await manageLinks(serviceRoleClient, 'caregivers_students', studentId, caregiver_ids, 'student_id', 'caregiver_id');
    }

    // 5. Busca os vínculos atuais para retornar na resposta (Confirmação de Gravação)
    const { data: currentGuardians } = await serviceRoleClient
      .from('guardians_students')
      .select('guardian_id')
      .eq('student_id', studentId);

    const { data: currentCaregivers } = await serviceRoleClient
      .from('caregivers_students')
      .select('caregiver_id')
      .eq('student_id', studentId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: studentId,
        guardian_ids: currentGuardians?.map(g => g.guardian_id) || [],
        caregiver_ids: currentCaregivers?.map(c => c.caregiver_id) || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: `Erro na Edge Function: ${error.message}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } // Retorna 200 para o erro chegar no frontend
    )
  }
})