import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const userRecordSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
  role: z.enum(['gestor', 'cuidador', 'responsavel', 'professor']),
  // Campos opcionais
  cpf: z.string().trim().max(14, "CPF inválido").optional().nullable(),
  phone: z.string().trim().max(20, "Telefone inválido").optional().nullable(),
  function_title: z.string().trim().max(100, "Função muito longa").optional().nullable(),
  work_schedule: z.string().trim().max(500, "Horário muito longo").optional().nullable(),
  student_ids: z.array(z.string()).optional().default([]), // Aceita os estudantes vinculados
}).strip();

serve(async (req) => {
  const responseHeaders = getCorsHeaders(req);

  // Lida com a requisição pre-flight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: responseHeaders });
  }

  try {
    // 1. Cria um cliente Supabase com privilégios de administrador
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 2. Verifica se a requisição vem de um gestor autenticado
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Acesso não autorizado. Token inválido." }), {
        headers: { ...responseHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // 3. Confirma se o usuário autenticado tem o perfil 'gestor'
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id) // CORREÇÃO: Usar 'user_id' para buscar o perfil do usuário autenticado.
      .single();

    if (profileError || profile?.role !== 'gestor') {
      return new Response(JSON.stringify({ error: "Acesso negado. Apenas gestores podem criar novos usuários." }), {
        headers: { ...responseHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // 4. Extrai a LISTA de registros do corpo da requisição
    const records = await req.json();
    console.log(`[${new Date().toISOString()}] Parsed request body, received ${records?.length ?? 0} items.`);

    if (!Array.isArray(records)) {
      return new Response(JSON.stringify({ successCount: 0, errorCount: 1, errors: [{ line: 0, error: "O corpo da requisição é inválido. Esperava-se um array de usuários." }] }), {
        headers: { ...responseHeaders, "Content-Type": "application/json" }, status: 400
      });
    }

    if (records.length === 0) {
      return new Response(JSON.stringify({ successCount: 0, errorCount: 1, errors: [{ line: 0, error: "O arquivo enviado está vazio ou não contém dados válidos." }] }), {
        headers: { ...responseHeaders, "Content-Type": "application/json" }, status: 400
      });
    }


    let successCount = 0;
    let errorCount = 0;
    const importErrors: { line: number, error: string }[] = [];
    const createdAuthUsers = []; // Array para rastrear usuários criados para inserção de perfil
    const guardianAssignments = []; // Vínculos de responsáveis
    const caregiverAssignments = []; // Vínculos de cuidadores

    // 5. Itera sobre cada registro para criar os usuários
    for (let i = 0; i < records.length; i++) { // ETAPA 1: Validação e Criação na Autenticação
      const record = records[i];
      const lineNumber = i + 2; // +2 para corresponder à linha da planilha (cabeçalho + índice 0)

      try {
        // Validação com Zod antes de qualquer operação
        const validation = userRecordSchema.safeParse(record);
        if (!validation.success) {
          // Concatena todos os erros de validação para a linha atual
          const fieldErrors = validation.error.flatten().fieldErrors;
          const errorMessage = Object.entries(fieldErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          throw new Error(errorMessage);
        }

        const { email } = validation.data;
        // Se a senha não for fornecida, gera uma segura e aleatória para o convite.
        const password = validation.data.password || crypto.randomUUID() + crypto.randomUUID();

        // Cria o usuário no serviço de autenticação
        const { data: authData, error: authUserError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // O usuário precisará confirmar o email
        });

        if (authUserError) throw authUserError;
        if (!authData.user) throw new Error("Falha ao criar usuário na autenticação.");

        createdAuthUsers.push({ authUser: authData.user, validatedData: validation.data });

      } catch (error) {
        errorCount++;
        // Garante que a mensagem de erro seja uma string.
        const errorMessage = error instanceof Error ? error.message : String(error);
        importErrors.push({ line: lineNumber, error: errorMessage.replace("string:", "") });
        continue; // Pula para a próxima iteração em caso de erro
      }
    }
    
    // ETAPA 2: Atualização dos Perfis e Preparação dos Vínculos
    if (createdAuthUsers.length > 0) {
      // Prepara os dados para a atualização. O perfil já foi criado pelo trigger.
      const profileUpdates = createdAuthUsers.map(({ authUser, validatedData }) => ({
        user_id: authUser.id, // Chave para o 'eq'
        name: validatedData.name,
        role: validatedData.role,
        cpf: validatedData.cpf,
        phone: validatedData.phone,
        function_title: validatedData.function_title,
        work_schedule: validatedData.work_schedule,
      }));      

      createdAuthUsers.forEach(({ authUser, validatedData }, index) => {
        // Se houver IDs de estudantes, prepara os vínculos
        if (validatedData.student_ids && validatedData.student_ids.length > 0) {
          if (validatedData.role === 'responsavel') { // Vínculo para Responsáveis
          const assignments = validatedData.student_ids.map(student_id => ({
            guardian_id: authUser.id, // O vínculo é com o ID de autenticação
            student_id,
            relationship: 'responsavel' 
          }));
          guardianAssignments.push(...assignments);
          }
          else if (validatedData.role === 'cuidador') { // Vínculo para Cuidadores
            const assignments = validatedData.student_ids.map(student_id => ({
              caregiver_id: authUser.id, // O vínculo é com o ID de autenticação
              student_id,
            }));
            caregiverAssignments.push(...assignments);
          }
        }
      });

      // ETAPA 2.1: Atualiza os perfis em lote para obter os IDs dos perfis
      // Esta etapa é crucial para obter os IDs dos perfis que foram criados pelo trigger.
      const { data: updatedProfiles, error: batchUpdateError } = await supabaseAdmin
        .from('profiles')
        .upsert(profileUpdates, { onConflict: 'user_id' })
        .select('id, user_id');

      if (batchUpdateError) {
        // Rollback: Se a atualização de qualquer perfil falhar, deleta os usuários de autenticação criados.
        console.error("Erro na atualização em lote de perfis, iniciando rollback:", batchUpdateError);
        for (const { authUser } of createdAuthUsers) {
          await supabaseAdmin.auth.admin.deleteUser(authUser.id);
        }
        throw new Error(`Falha crítica ao salvar perfis. A importação foi revertida. Erro: ${batchUpdateError.message}`);
      }

      // Mapeia o auth_id para o profile_id
      const authIdToProfileId = new Map(updatedProfiles.map(p => [p.user_id, p.id]));

      // CORREÇÃO: Substitui o auth_id pelo profile_id nos vínculos
      guardianAssignments.forEach(a => { a.guardian_id = authIdToProfileId.get(a.guardian_id) });
      caregiverAssignments.forEach(a => { a.caregiver_id = authIdToProfileId.get(a.caregiver_id) });

      // Filtra vínculos que não conseguiram encontrar um profile_id (caso raro)
      const finalGuardianAssignments = guardianAssignments.filter(a => a.guardian_id);
      const finalCaregiverAssignments = caregiverAssignments.filter(a => a.caregiver_id);

      // ETAPA 2.5: Validação e filtragem dos Vínculos (se houver)
      let validGuardianAssignments = [...guardianAssignments];
      let validCaregiverAssignments = [...caregiverAssignments];
      const allStudentIdsToValidate = [...new Set([...guardianAssignments.map(a => a.student_id), ...caregiverAssignments.map(a => a.student_id)])];

      if (allStudentIdsToValidate.length > 0) {
        const { data: existingStudents, error: studentCheckError } = await supabaseAdmin
          .from('students')
          .select('id')
          .in('id', allStudentIdsToValidate);

        if (studentCheckError) {
          throw new Error(`Falha ao verificar estudantes: ${studentCheckError.message}`);
        }

        const existingStudentIds = new Set(existingStudents.map(s => s.id));
        
        // Filtra para manter apenas os vínculos com estudantes que existem
        validGuardianAssignments = guardianAssignments.filter(a => existingStudentIds.has(a.student_id));
        validCaregiverAssignments = caregiverAssignments.filter(a => existingStudentIds.has(a.student_id));
        // Nota: Seria possível adicionar os IDs inválidos à lista de 'importErrors' para notificar o usuário.
      }

      // ETAPA 3: Inserção dos Vínculos Válidos
      if (updatedProfiles.length > 0) {
        successCount = createdAuthUsers.length;
        if (finalGuardianAssignments.length > 0) {
          const { error: assignmentError } = await supabaseAdmin.from('guardians_students').insert(finalGuardianAssignments);
          if (assignmentError) {
            console.error("Erro ao vincular responsáveis a estudantes:", assignmentError);
            importErrors.push({ line: 0, error: `Usuários criados, mas falha ao vincular responsáveis: ${assignmentError.message}` });
          }
        }
        if (finalCaregiverAssignments.length > 0) {
          const { error: assignmentError } = await supabaseAdmin.from('caregivers_students').insert(finalCaregiverAssignments);
          if (assignmentError) {
            console.error("Erro ao vincular cuidadores a estudantes:", assignmentError);
            importErrors.push({ line: 0, error: `Usuários criados, mas falha ao vincular cuidadores: ${assignmentError.message}` });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ successCount, errorCount, errors: importErrors }),
      { headers: { ...responseHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Critical error in create-user:`, error);
    return new Response(
      JSON.stringify({
        successCount: 0,
        errorCount: 1,
        errors: [{ line: 0, error: `Erro inesperado no servidor: ${error.message}` }],
      }),
      { headers: { ...responseHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});