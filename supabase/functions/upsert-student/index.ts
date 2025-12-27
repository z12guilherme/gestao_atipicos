import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função auxiliar para gerenciar os vínculos de forma transacional
async function manageLinks(supabase: SupabaseClient, tableName: string, studentId: string, entityIds: string[], studentKey: string, entityKey: string) {
  // Deleta os vínculos existentes para o estudante
  const { error: deleteError } = await supabase.from(tableName).delete().eq(studentKey, studentId);
  if (deleteError) throw deleteError;

  // Se houver novos IDs, insere os novos vínculos
  if (entityIds && Array.isArray(entityIds) && entityIds.length > 0) {
    // Remove duplicatas para evitar erros de violação de unicidade no banco
    const uniqueIds = [...new Set(entityIds)];
    
    const inserts = uniqueIds.map(id => ({ [studentKey]: studentId, [entityKey]: id }));
    const { error: insertError } = await supabase.from(tableName).insert(inserts);
    if (insertError) throw insertError;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Usa a chave de serviço (service_role) para operações administrativas que precisam bypassar o RLS
    const serviceRoleClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
    const { id, guardian_ids, caregiver_ids, ...studentData } = await req.json();
    
    // 3. Cria ou atualiza os dados do estudante
    const { data: studentResult, error: studentError } = await serviceRoleClient
      .from('students')
      .upsert({ id, ...studentData })
      .select()
      .single();
      
    if (studentError) throw studentError;
    const studentId = studentResult.id;
    
    // 4. Gerencia os vínculos
    if (guardian_ids) {
      await manageLinks(serviceRoleClient, 'guardians_students', studentId, guardian_ids, 'student_id', 'guardian_id');
    }
    
    if (caregiver_ids) {
      await manageLinks(serviceRoleClient, 'caregivers_students', studentId, caregiver_ids, 'student_id', 'caregiver_id');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: studentId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})