import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'

// Define the CORS headers required for the browser to allow the request.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allows any origin
  'Access-control-allow-methods': 'POST, OPTIONS', // Specifies allowed methods
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // This is the crucial part: it handles the preflight OPTIONS request.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the user making the request.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Authenticate the user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized: User not found.');
    }
    
    // 2. Authorize: Ensure the user is a 'gestor'
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'gestor') {
       return new Response(JSON.stringify({ error: 'Forbidden: User is not a manager.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // 3. Process the request body
    const { id, guardian_ids, caregiver_ids, ...studentData } = await req.json();

    // 4. Upsert student data (create or update)
    const { data: studentResult, error: studentError } = await supabaseClient
      .from('students')
      .upsert({ id, ...studentData })
      .select()
      .single();

    if (studentError) throw studentError;
    const studentId = studentResult.id;

    // 5. Manage relationships transactionally
    // Manage guardian relationships
    if (guardian_ids) {
      await supabaseClient.from('guardians_students').delete().eq('student_id', studentId);
      if (guardian_ids.length > 0) {
        const guardianInserts = guardian_ids.map((gid: string) => ({ student_id: studentId, guardian_id: gid, relationship: 'Responsável' }));
        await supabaseClient.from('guardians_students').insert(guardianInserts);
      }
    }

    // Manage caregiver relationships
    if (caregiver_ids) {
      await supabaseClient.from('caregivers_students').delete().eq('student_id', studentId);
      if (caregiver_ids.length > 0) {
        const caregiverInserts = caregiver_ids.map((cid: string) => ({ student_id: studentId, caregiver_id: cid }));
        await supabaseClient.from('caregivers_students').insert(caregiverInserts);
      }
    }

    return new Response(JSON.stringify({ id: studentId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error in upsert-student function:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})