// supabase/functions/bulk-create-users/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from '../_shared/cors.ts'

// Schema para validar cada linha do CSV
const userSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  role: z.enum(['gestor', 'cuidador', 'responsavel'], {
    errorMap: () => ({ message: "Perfil deve ser 'gestor', 'cuidador' ou 'responsavel'" })
  }),
  // Adicione outros campos opcionais que você queira importar
  cpf: z.string().optional(),
  phone: z.string().optional(),
});

Deno.serve(async (req) => {
  // Lida com a requisição pre-flight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const userList = await req.json()
    if (!Array.isArray(userList)) {
      throw new Error("O corpo da requisição deve ser um array de usuários.");
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
      const line = index + 2; // +1 para o índice base 1, +1 para o cabeçalho do CSV

      // Validação com Zod
      const validation = userSchema.safeParse(userData);
      if (!validation.success) {
        results.errorCount++;
        const errorMessages = validation.error.flatten().fieldErrors;
        const firstError = Object.values(errorMessages)[0]?.[0] || 'Dados inválidos';
        results.errors.push({ line, error: `Linha ${line}: ${firstError}` });
        continue;
      }

      const { email, password, name, role, ...rest } = validation.data;

      // 1. Cria o usuário no Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        results.errorCount++;
        results.errors.push({ line, error: `Linha ${line} (Email: ${email}): ${authError.message}` });
        continue;
      }

      // 2. Insere o perfil na tabela 'profiles'
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: authData.user.id,
        name,
        role,
        email,
        ...rest,
      });

      if (profileError) {
        // Se a inserção do perfil falhar, deleta o usuário do Auth para não deixar lixo
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        results.errorCount++;
        results.errors.push({ line, error: `Linha ${line} (Email: ${email}): ${profileError.message}` });
        continue;
      }

      results.successCount++;
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
