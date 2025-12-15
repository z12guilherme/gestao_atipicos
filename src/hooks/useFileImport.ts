import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Papa from "papaparse";
import ExcelJS from 'exceljs';
import { supabase } from "@/integrations/supabase/client";

interface UseFileImportProps {
  supabaseFunction: string;
  invalidateQueryKey: string;
  entityName: string; // e.g., "estudantes" or "usuários"
}

export function useFileImport({ supabaseFunction, invalidateQueryKey, entityName }: UseFileImportProps) {
  const queryClient = useQueryClient();

  const [isImportOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<{ line: number; error: string }[]>([]);
  const [isErrorsDialogOpen, setErrorsDialogOpen] = useState(false);

  const resetImportState = () => {
    setImportOpen(false);
    setImportFile(null);
    setImportErrors([]);
    setIsImporting(false);
  };

  const handleImport = () => {
    if (!importFile) {
      toast.error("Por favor, selecione um arquivo para importar.");
      return;
    }

    setIsImporting(true);

    const processData = async (data: any[]) => {
      try {
        // Filtro robusto: garante que a linha seja um objeto e que a coluna 'name' (obrigatória) esteja preenchida.
        // Isso evita o processamento de linhas vazias ou mal formatadas que são comuns em planilhas.
        const validData = data.filter(row => 
          row && typeof row === 'object' && typeof row.name === 'string' && row.name.trim() !== ''
        );

        if (validData.length === 0) {
          toast.error("Nenhum dado válido encontrado no arquivo.", { 
            description: "Verifique se a planilha não está vazia e se a coluna 'name' está preenchida." 
          });
          return;
        }

        const { data: responseData, error } = await supabase.functions.invoke(supabaseFunction, {
          body: validData,
        });

        if (error) {
          // Trata erros de rede ou da própria função (ex: 500 Internal Server Error)
          throw new Error(`Falha na comunicação com o servidor: ${error.message}`);
        }

        const { successCount, errorCount, errors } = responseData;

        if (errorCount > 0) {
          setImportErrors(errors);
          setErrorsDialogOpen(true);
          toast.warning(`${successCount} ${entityName} importados com sucesso.`, {
            description: `Falha em ${errorCount} linhas. Verifique os detalhes para corrigir.`,
          });
        } else {
          toast.success(`${successCount} ${entityName} importados com sucesso!`);
          resetImportState();
        }

      } catch (e: any) {
        toast.error("Falha ao importar arquivo.", { description: e.message });
      } finally {
        setIsImporting(false);
        // Invalida a query aqui para garantir que a lista seja atualizada
        // mesmo que haja erros parciais na importação.
        queryClient.invalidateQueries({ queryKey: [invalidateQueryKey] });
      }
    };

    if (importFile.type === 'text/csv' || importFile.name.endsWith('.csv')) {
      Papa.parse(importFile, { header: true, skipEmptyLines: true, complete: (results) => processData(results.data) });
    } else if (importFile.type.includes('spreadsheetml') || importFile.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          
          const worksheet = workbook.worksheets[0];
          if (!worksheet) throw new Error("Planilha vazia ou inválida.");

          const jsonData: any[] = [];
          let headers: string[] = [];

          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
              // ExcelJS retorna [undefined, 'col1', 'col2'] (baseado em 1)
              headers = (row.values as any[]).map(v => v ? String(v) : '');
            } else {
              const rowData: any = {};
              for (let i = 1; i < headers.length; i++) {
                const header = headers[i];
                if (header) {
                  let value = row.getCell(i).value;
                  // Tratamento simples para objetos (ex: hyperlinks)
                  if (value && typeof value === 'object' && 'text' in value) {
                    value = (value as any).text;
                  }
                  rowData[header] = value;
                }
              }
              jsonData.push(rowData);
            }
          });
          processData(jsonData);
        } catch (error: any) {
          console.error("Erro ao processar Excel:", error);
          toast.error("Erro ao ler o arquivo Excel.", { description: error.message });
          setIsImporting(false);
        }
      };
      reader.onerror = (error) => {
        toast.error("Erro ao ler o arquivo.", { description: error.message });
        setIsImporting(false);
      };
      reader.readAsArrayBuffer(importFile);
    } else {
      toast.error("Formato de arquivo não suportado. Use CSV ou XLSX.");
      setIsImporting(false);
    }
  };

  return {
    isImportOpen, setImportOpen,
    importFile, setImportFile,
    isImporting,
    importErrors,
    isErrorsDialogOpen, setErrorsDialogOpen,
    handleImport,
  };
}