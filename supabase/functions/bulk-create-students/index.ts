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
  cpf: z.string().max(14).nullable().optional().or(z.literal('')),
  class_name: z.string().nullable().optional().or(z.literal('')),
  school_year: z.string().nullable().optional().or(z.literal('')),
  diagnosis: z.string().nullable().optional().or(z.literal('')),
  special_needs: z.string().nullable().optional().or(z.literal('')),
  additional_info: z.string().nullable().optional().or(z.literal('')),
  medical_info: z.string().nullable().optional().or(z.literal('')),
}).strip(); // .strip() é importante para ignorar colunas extras que não estão no schema.

// Função para tentar converter a data para o formato AAAA-MM-DD
function parseDate(dateStr: string | number | undefined): string | undefined {
  if (!dateStr) return undefined;
  // O Excel às vezes exporta datas como números seriais. Esta é uma conversão simplificada.
  if (typeof dateStr === 'number') {
    return new Date(Math.round((dateStr - 25569) * 86400 * 1000)).toISOString().split('T')[0];
  }
  return new Date(dateStr).toISOString().split('T')[0];
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

      // Pré-processamento da data
      if (studentData.birth_date) {
        studentData.birth_date = parseDate(studentData.birth_date);
      }

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
      studentsToInsert.push(validation.data);
    }

    if (studentsToInsert.length > 0) {
      const { error: insertError, count } = await supabaseAdmin
        .from('students')
        .insert(studentsToInsert);

      if (insertError) {
        // Se a inserção em lote falhar, reportamos um erro geral
        throw new Error(`Falha ao inserir estudantes: ${insertError.message}`);
      }
      results.successCount = count ?? 0;
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
