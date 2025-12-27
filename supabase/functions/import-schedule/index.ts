import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Cliente para autenticação do usuário (validação do token)
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 2. Cliente Admin para operações no banco (Bypass RLS para garantir leitura/escrita)
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) {
      throw new Error('Erro de configuração: SUPABASE_SERVICE_ROLE_KEY não definida.');
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    // Parse do corpo da requisição (espera um JSON com array de agendamentos)
    const { student_id, schedules } = await req.json()

    if (!student_id) {
      throw new Error('ID do estudante é obrigatório.')
    }
    
    if (!schedules || !Array.isArray(schedules)) {
      throw new Error('Formato de dados inválido. Esperado array de agendamentos.')
    }

    // 1. Obter usuário logado
    const { data: { user }, error: userError } = await authClient.auth.getUser()
    if (userError || !user) throw new Error('Usuário não autenticado.')

    // 2. Verificar se é Cuidador
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id) // Correção: Busca pela coluna user_id, não pelo id (PK)
      .limit(1) // Garante que apenas um perfil seja retornado, mesmo que haja duplicatas.
      .single() // Converte o resultado em um único objeto.

    if (profileError || !profile) {
      console.error('Erro ao buscar perfil:', profileError);
      throw new Error(`Perfil de usuário não encontrado. ID: ${user.id}. Detalhes: ${profileError?.message || 'Nenhum registro encontrado.'}`);
    }

    if (profile.role?.toLowerCase().trim() !== 'cuidador') {
      throw new Error(`Apenas cuidadores podem realizar esta operação. Seu perfil atual é: ${profile.role}`)
    }

    // 3. Verificar vínculo com o estudante específico
    const { data: link } = await adminClient
      .from('caregivers_students')
      .select('student_id')
      .eq('caregiver_id', profile.id)
      .eq('student_id', student_id)
      .single()

    if (!link) {
      throw new Error('Você não possui permissão para importar cronograma para este estudante.')
    }

    // 4. Validar e preparar dados para inserção
    const toInsert = [];
    const validationErrors: string[] = [];
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Valida o formato HH:MM

    schedules.forEach((item: any, index: number) => {
      const activity = item.activity;
      const time = item.time;

      if (!activity || typeof activity !== 'string' || activity.trim() === '') {
        validationErrors.push(`Linha ${index + 2}: A coluna 'Atividade' não pode estar vazia.`);
        return; // Pula para o próximo item
      }

      if (!time || !timeRegex.test(time)) {
        validationErrors.push(`Linha ${index + 2}: O formato da hora "${time}" é inválido. Use HH:MM.`);
        return; // Pula para o próximo item
      }

      toInsert.push({
        student_id: student_id,
        caregiver_id: profile.id,
        activity: activity.trim(),
        start_time: time,
        date: item.date || new Date().toISOString().split('T')[0]
      });
    });

    if (validationErrors.length > 0) {
      throw new Error(`Erros de validação na planilha:\n- ${validationErrors.join('\n- ')}`);
    }

    // 5. Inserir dados válidos em lote
    if (toInsert.length > 0) {
      const { error: insertError } = await adminClient
        .from('schedules')
        .insert(toInsert)

      if (insertError) throw insertError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${toInsert.length} agendamentos importados com sucesso.`
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
