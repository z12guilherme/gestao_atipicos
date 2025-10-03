import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from '../_shared/cors.ts'
 
// Schema para validar cada linha do CSV de estudantes
const studentSchema = z.object({
  name: z.string({ required_error: "A coluna 'name' é obrigatória." }).trim().min(3, "O nome deve ter pelo menos 3 caracteres."),
  birth_date: z.string({ required_error: "A coluna 'birth_date' é obrigatória." }).min(1, "A data de nascimento é obrigatória."),
  status: z.enum(['ativo', 'inativo', 'transferido'], {
    errorMap: () => ({ message: "Status deve ser 'ativo', 'inativo' ou 'transferido'" })
  }),
  // Campos opcionais
  cpf: z.string().max(14).nullable().optional(),
  class_name: z.string().nullable().optional(),
  school_year: z.string().nullable().optional(),
  diagnosis: z.string().nullable().optional(),
  special_needs: z.string().nullable().optional(),
  additional_info: z.string().nullable().optional(),
  medical_info: z.string().nullable().optional(),
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
  // Lida com a requisição pre-flight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const studentList = await req.json();
    if (!Array.isArray(studentList)) {
      throw new Error("O corpo da requisição deve ser um array de estudantes.");
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
        // Em caso de erro no banco (ex: violação de constraint),
        // retornamos o erro, mas com status 200 para o frontend tratar.
        results.errorCount = studentsToInsert.length;
        results.errors.push({ line: 0, error: `Erro no banco de dados: ${insertError.message}` });
        results.successCount = 0;
      } else {
        results.successCount = studentsToInsert.length;
      }
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
