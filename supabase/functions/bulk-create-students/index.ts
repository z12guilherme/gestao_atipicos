import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

// Schema para validar cada linha do CSV de estudantes
const studentSchema = z.object({
  name: z.string({ required_error: "A coluna 'name' é obrigatória." }).trim().min(3, "O nome deve ter pelo menos 3 caracteres."),
  birth_date: z.string({ required_error: "A coluna 'birth_date' é obrigatória." }),
  status: z.enum(['ativo', 'inativo', 'transferido'], { errorMap: () => ({ message: "O status deve ser 'ativo', 'inativo' ou 'transferido'." }) }),
  // Campos opcionais
  cpf: z.string().trim().max(14, "CPF inválido").nullable().optional(),
  class_name: z.string().trim().nullable().optional(),
  school_year: z.string().trim().nullable().optional(),
  diagnosis: z.string().trim().nullable().optional(),
  special_needs: z.string().trim().nullable().optional(),
  medical_info: z.string().trim().nullable().optional(),
  additional_info: z.string().trim().nullable().optional(),
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
    const studentList = await req.json();
    console.log(`[${new Date().toISOString()}] Parsed request body, received ${studentList?.length ?? 0} items.`);

    if (!Array.isArray(studentList)) {
      throw new Error("O corpo da requisição deve ser um array de estudantes.");
    }

    if (studentList.length === 0) {
      return new Response(JSON.stringify({ successCount: 0, errorCount: 1, errors: [{ line: 0, error: "O arquivo enviado está vazio ou não contém dados válidos." }] }), {
        headers: responseHeaders, status: 400 });
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

    const studentsToInsert = [];

    for (const [index, studentData] of studentList.entries()) {
      const line = index + 2; // +1 para o índice base 1, +1 para o cabeçalho do CSV

      // Pré-processamento e validação da data
      const parsedDate = parseDate(studentData.birth_date);
      if (studentData.birth_date && !parsedDate) {
        results.errorCount++;
        results.errors.push({ line, error: `Linha ${line}: Formato de data inválido para '${studentData.birth_date}'. Use AAAA-MM-DD ou DD/MM/AAAA.` });
        continue;
      }
      // Validação com Zod
      const validation = studentSchema.safeParse({ ...studentData, birth_date: parsedDate });
      if (!validation.success) {
        results.errorCount++;
        const errorMessages = validation.error.flatten().fieldErrors;
        const firstError = Object.values(errorMessages)[0]?.[0] || 'Dados inválidos';
        results.errors.push({ line, error: `Linha ${line}: ${firstError}` });
        continue;
      }
      
      // Adiciona o estudante validado à lista para inserção em lote
      studentsToInsert.push(validation.data);
    }

    if (studentsToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('students')
        .insert(studentsToInsert);

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        results.errorCount = studentsToInsert.length; // All failed if batch insert fails
        results.errors.push({ line: 0, error: `Erro no banco de dados: ${insertError.message}` });
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