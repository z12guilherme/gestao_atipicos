import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const userRecordSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(['gestor', 'cuidador', 'responsavel']),
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
      throw new Error("Acesso não autorizado. Token inválido.");
    }

    // 3. Confirma se o usuário autenticado tem o perfil 'gestor'
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'gestor') {
      throw new Error("Apenas gestores podem criar novos usuários.");
    }

    // 4. Extrai a LISTA de registros do corpo da requisição
    const records = await req.json();
    console.log(`[${new Date().toISOString()}] Parsed request body, received ${records?.length ?? 0} items.`);

    if (!Array.isArray(records)) {
      return new Response(JSON.stringify({ successCount: 0, errorCount: 1, errors: [{ line: 0, error: "O corpo da requisição é inválido. Esperava-se um array de usuários." }] }), {
        headers: responseHeaders, status: 400
      });
    }

    if (records.length === 0) {
      return new Response(JSON.stringify({ successCount: 0, errorCount: 1, errors: [{ line: 0, error: "O arquivo enviado está vazio ou não contém dados válidos." }] }), {
        headers: responseHeaders, status: 400
      });
    }


    let successCount = 0;
    const importErrors: { line: number, error: string }[] = [];
    const profilesToInsert = []; // Array para coletar perfis para inserção em lote
    const createdAuthUserIds: string[] = []; // Array para rastrear IDs de usuários criados para possível rollback

    // 5. Itera sobre cada registro para criar os usuários
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const lineNumber = i + 2; // +2 para corresponder à linha da planilha (cabeçalho + índice 0)

      try {
        // Validação com Zod antes de qualquer operação
        const validation = userRecordSchema.safeParse(record);
        if (!validation.success) {
          const firstError = validation.error.flatten().fieldErrors;
          const errorMessage = Object.values(firstError)[0]?.[0] || 'Dados inválidos';
          throw new Error(errorMessage);
        }

        const { email, password } = validation.data;

        // Cria o usuário no serviço de autenticação
        const { data: authData, error: authUserError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authUserError) throw authUserError;
        if (!authData.user) throw new Error("Falha ao criar usuário na autenticação.");

        createdAuthUserIds.push(authData.user.id); // Rastreia o ID do usuário criado

        // Adiciona o perfil ao array para inserção em lote
        const { password: _password, ...profileData } = validation.data;
        profilesToInsert.push({
          id: authData.user.id,
          ...profileData,
          student_ids: profileData.student_ids || [],
        });

        successCount++;
      } catch (error) {
        importErrors.push({ line: lineNumber, error: error.message });
      }
    }

    // 6. Insere todos os perfis coletados de uma só vez
    if (profilesToInsert.length > 0) {
      const { error: batchInsertError } = await supabaseAdmin
        .from('profiles')
        .insert(profilesToInsert);

      if (batchInsertError) {
        // Rollback: Se a inserção dos perfis falhar, tenta deletar os usuários de autenticação criados.
        console.error("Erro na inserção em lote de perfis:", batchInsertError);
        console.log(`Iniciando rollback para ${createdAuthUserIds.length} usuários...`);
        for (const userId of createdAuthUserIds) {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        }
        console.log("Rollback concluído.");

        // Limpa erros individuais, pois a operação em lote falhou como um todo.
        importErrors.length = 0;
        // Adiciona uma única mensagem de erro clara para o usuário.
        importErrors.push({ line: 0, error: `Falha crítica ao salvar perfis. A importação foi revertida. Erro: ${batchInsertError.message}` });
        // Zera a contagem de sucessos, pois os perfis não foram criados.
        successCount = 0;
      }
    }

    return new Response(
      JSON.stringify({ successCount, errorCount: importErrors.length, errors: importErrors }),
      { headers: responseHeaders, status: 200 },
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Critical error in create-user:`, error.message);
    return new Response(
      JSON.stringify({
        successCount: 0,
        errorCount: 1,
        errors: [{ line: 0, error: `Erro inesperado no servidor: ${error.message}` }],
      }),
      { headers: responseHeaders, status: 500 }
    );
  }
});