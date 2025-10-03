import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
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
        // Filtro mais robusto: garante que a linha exista e que a coluna 'name' (obrigatória) esteja preenchida.
        // Isso evita o processamento de linhas vazias ou mal formatadas que podem ser geradas por planilhas.
        const validData = data.filter(row => 
          row && typeof row.name === 'string' && row.name.trim() !== ''
        );

        if (validData.length === 0) {
          toast.error("Nenhum dado válido encontrado no arquivo.", { description: "Verifique se a planilha não está vazia e se a coluna 'name' está preenchida." });
          return;
        }

        const { data: responseData, error } = await supabase.functions.invoke(supabaseFunction, {
          body: validData,
        });

        const { successCount, errorCount, errors } = responseData;

        if (errorCount > 0) {
          setImportErrors(errors);
          setErrorsDialogOpen(true);
          toast.warning(`${successCount} ${entityName} importados com sucesso.`, {
            description: `Falha em ${errorCount} linhas. Verifique os detalhes para corrigir.`,
          });
        } else {
          toast.success(`${successCount} ${entityName} importados com sucesso!`);
        }

        queryClient.invalidateQueries({ queryKey: [invalidateQueryKey] });
        resetImportState();
      } catch (e: any) {
        toast.error("Falha ao importar arquivo.", { description: e.message });
      } finally {
        setIsImporting(false);
      }
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      processData(json);
    };
    reader.onerror = (error) => {
      toast.error("Erro ao ler o arquivo.", { description: error.message });
      setIsImporting(false);
    };

    if (importFile.type === 'text/csv' || importFile.name.endsWith('.csv')) {
      Papa.parse(importFile, { header: true, skipEmptyLines: true, complete: (results) => processData(results.data) });
    } else if (importFile.type.includes('spreadsheetml') || importFile.name.endsWith('.xlsx')) {
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