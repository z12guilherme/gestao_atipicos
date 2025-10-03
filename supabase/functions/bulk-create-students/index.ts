import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

// Schema para validar cada linha do CSV de estudantes
const studentSchema = z.object({
  name: z.string({ required_error: "A coluna 'name' é obrigatória." }).trim().min(3, "O nome deve ter pelo menos 3 caracteres."),
  birth_date: z.preprocess((arg) => {
    // Pré-processa o campo 'birth_date' antes da validação
    if (!arg) return undefined;
    // Tenta converter a data usando a função parseDate
    return parseDate(arg as string | number);
  }, z.string({ required_error: "A coluna 'birth_date' é obrigatória e o formato é inválido." }).regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido. Use AAAA-MM-DD ou DD/MM/AAAA.")),
  status: z.enum(['ativo', 'inativo', 'transferido'], { errorMap: () => ({ message: "O status deve ser 'ativo', 'inativo' ou 'transferido'." }) }),
  // Campos opcionais
  cpf: z.string().trim().max(14, "CPF inválido").nullable().optional(),
  class_name: z.string().trim().nullable().optional(),
  diagnosis: z.string().trim().nullable().optional(),
  special_needs: z.string().trim().nullable().optional(),
  medical_info: z.string().trim().nullable().optional(),
  guardian_id: z.string().uuid("ID do responsável inválido").nullable().optional(),
}).strip(); // .strip() é importante para ignorar colunas extras que não estão no schema.

/**
 * Converte diferentes formatos de data para o padrão AAAA-MM-DD.
 * Suporta:
 * - Números seriais do Excel.
 * - Strings no formato 'DD/MM/AAAA'.
 * - Strings já em formatos reconhecíveis pelo `new Date()`.
 * Retorna `undefined` se a data for inválida ou vazia.
 */
function parseDate(dateInput: string | number | undefined): string | undefined {
  if (!dateInput) return undefined;

  let date: Date;

  if (typeof dateInput === 'number') {
    // Converte número serial do Excel para data
    date = new Date(Math.round((dateInput - 25569) * 86400 * 1000));
  } else if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
    // Converte formato DD/MM/AAAA para AAAA-MM-DD para evitar erros de fuso horário
    const [day, month, year] = dateInput.split('/');
    date = new Date(`${year}-${month}-${day}T00:00:00`);
  } else {
    date = new Date(dateInput);
  }

  // Verifica se a data resultante é válida
  if (isNaN(date.getTime())) {
    return undefined; // Retorna undefined se a data for inválida
  }

  return date.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  const responseHeaders = getCorsHeaders(req);

  // Lida com a requisição pre-flight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: responseHeaders });
  }
  
  console.log(`[${new Date().toISOString()}] Received request for bulk-create-students: ${req.method}`);

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validação de segurança: Garante que apenas gestores podem executar esta função.
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Acesso não autorizado. Token inválido.");
    }

    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();

    if (profileError || profile?.role !== 'gestor') {
      throw new Error("Apenas gestores podem importar estudantes.");
    }

    const studentList = await req.json();
    console.log(`[${new Date().toISOString()}] Parsed request body, received ${studentList?.length ?? 0} items.`);

    if (!Array.isArray(studentList)) {
      throw new Error("O corpo da requisição deve ser um array de estudantes.");
    }

    if (studentList.length === 0) {
      return new Response(JSON.stringify({ successCount: 0, errorCount: 1, errors: [{ line: 0, error: "O arquivo enviado está vazio ou não contém dados válidos." }] }), {
        headers: responseHeaders, status: 400 });
    }

    const results = {
      successCount: 0,
      errorCount: 0,
      errors: [] as { line: number, error: string }[],
    };

    const studentsToInsert: { data: z.infer<typeof studentSchema>, line: number }[] = [];

    for (const [index, studentData] of studentList.entries()) {
      const line = index + 2; // +1 para o índice base 1, +1 para o cabeçalho do CSV

      // Validação com Zod
      const validation = studentSchema.safeParse(studentData);
      if (!validation.success) {
        results.errorCount++;
        const errorMessages = validation.error.flatten().fieldErrors;
        const firstError = Object.values(errorMessages)[0]?.[0] || 'Dados inválidos';
        results.errors.push({ line, error: `Linha ${line}: ${firstError}` });
        continue;
      }
      
      // Adiciona o estudante validado à lista para inserção em lote
      studentsToInsert.push({ data: validation.data, line });
    }

    if (studentsToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('students')
        .insert(studentsToInsert.map(item => item.data)); // Insere apenas os dados

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        // Se a inserção em lote falhar, todos os estudantes na lista são considerados erros.
        results.errorCount += studentsToInsert.length;
        // Adiciona um erro para cada linha que falhou, usando o número da linha original.
        studentsToInsert.forEach((item) => {
          results.errors.push({ line: item.line, error: `Falha na inserção no banco de dados: ${insertError.message}` });
        });
        results.successCount = 0;
      } else {
        results.successCount = studentsToInsert.length;
      }
    }
    
    return new Response(JSON.stringify(results), {
      headers: responseHeaders,
      status: 200,
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Critical error in bulk-create-students:`, error);
    const results = {
      successCount: 0,
      errorCount: 1,
      errors: [{ line: 0, error: `Erro inesperado no servidor: ${error.message}. Verifique os logs da função no Supabase.` }],
    };
    return new Response(JSON.stringify(results), {
      headers: responseHeaders,
      status: 500,
    });
  }
});