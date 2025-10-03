import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from '../_shared/cors.ts'

// Schema para validar cada linha do CSV de usuários
const userSchema = z.object({
  name: z.string({ required_error: "A coluna 'name' é obrigatória." }).trim().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string({ required_error: "A coluna 'email' é obrigatória." }).email("O email fornecido é inválido."),
  password: z.string({ required_error: "A coluna 'password' é obrigatória." }).min(6, "A senha deve ter no mínimo 6 caracteres."),
  role: z.enum(['gestor', 'cuidador', 'responsavel'], {
    errorMap: () => ({ message: "O perfil ('role') deve ser 'gestor', 'cuidador' ou 'responsavel'." })
  }),
  // Campos opcionais
  cpf: z.string().max(14).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
}).strip();

Deno.serve(async (req) => {
  // Lida com a requisição pre-flight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  console.log(`[${new Date().toISOString()}] Received request: ${req.method}`);

  try {
    const userList = await req.json();
    console.log(`[${new Date().toISOString()}] Parsed request body, received ${userList?.length ?? 0} items.`);

    if (!Array.isArray(userList)) {
      throw new Error("O corpo da requisição deve ser um array de usuários.");
    }

    if (userList.length === 0) {
      return new Response(JSON.stringify({ successCount: 0, errorCount: 1, errors: [{ line: 0, error: "O arquivo enviado está vazio ou não contém dados válidos." }] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const results = {
      successCount: 0,
      errorCount: 0,
      errors: [] as { line: number, error: string }[],
    };

    for (const [index, userData] of userList.entries()) {
      const line = index + 2; // +1 para o índice base 1, +1 para o cabeçalho

      const validation = userSchema.safeParse(userData);
      if (!validation.success) {
        results.errorCount++;
        const errorMessages = validation.error.flatten().fieldErrors;
        const firstError = Object.values(errorMessages)[0]?.[0] || 'Dados inválidos';
        results.errors.push({ line, error: `Linha ${line}: ${firstError}` });
        continue;
      }

      const { name, email, password, role, ...rest } = validation.data;

      // 1. Cria o usuário na autenticação
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        results.errorCount++;
        results.errors.push({ line, error: `Linha ${line}: Erro ao criar autenticação - ${authError.message}` });
        continue;
      }

      // 2. Insere o perfil correspondente
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: authData.user.id,
        name,
        email,
        role,
        ...rest
      });

      if (profileError) {
        results.errorCount++;
        results.errors.push({ line, error: `Linha ${line}: Erro ao criar perfil - ${profileError.message}` });
        // Rollback: deleta o usuário da autenticação se a criação do perfil falhar
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        continue;
      }

      results.successCount++;
    }
    
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Critical error in bulk-create-users:`, error);
    const results = {
      successCount: 0,
      errorCount: 1,
      errors: [{ line: 0, error: `Erro inesperado no servidor: ${error.message}. Verifique os logs da função no Supabase.` }],
    };
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Always return 200 OK, let the frontend handle the error display.
    });
  }
});