import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { student_id } = await req.json();
    if (!student_id) {
      throw new Error('O ID do estudante é obrigatório.');
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) {
      throw new Error('Erro de configuração: SUPABASE_SERVICE_ROLE_KEY não definida.');
    }
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    );

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: profile } = await adminClient.from('profiles').select('role').eq('user_id', user.id).single();
    if (profile?.role !== 'gestor') {
      throw new Error('Apenas gestores podem realizar esta operação.');
    }

    const { data: caregiverLink } = await adminClient.from('caregivers_students').select('caregiver_id').eq('student_id', student_id).limit(1).single();
    const { data: guardianLink } = await adminClient.from('guardians_students').select('guardian_id').eq('student_id', student_id).limit(1).single();

    const links = {
      caregiverId: caregiverLink?.caregiver_id,
      guardianId: guardianLink?.guardian_id,
    };

    return new Response(
      JSON.stringify({ success: true, data: links }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: `Erro na função get-student-links: ${error.message}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
