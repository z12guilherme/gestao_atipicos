import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from '../_shared/cors.ts'

// Schema para validar cada linha do CSV de estudantes
const studentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento deve estar no formato AAAA-MM-DD").or(z.string().nonempty("Data de nascimento é obrigatória")),
  school_year: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'transferido', 'avaliando'], {
    errorMap: () => ({ message: "Status deve ser 'ativo', 'inativo', 'transferido' ou 'avaliando'" })
  }),
  // Campos opcionais
  cpf: z.string().optional(),
  class_name: z.string().optional(),
  diagnosis: z.string().optional(),
  special_needs: z.string().optional(),
  additional_info: z.string().optional(),
  medical_info: z.string().optional(),
});

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
