import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Upload, Loader2, Download } from "lucide-react";
import ExcelJS from 'exceljs';
import { supabase } from "@/integrations/supabase/client"; // Caminho corrigido
import { toast } from "sonner";

interface ScheduleImportModalProps {
  studentId: string;
  onSuccess?: () => void;
}

export function ScheduleImportModal({ studentId, onSuccess }: ScheduleImportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    // Cria uma planilha de exemplo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cronograma');
    
    worksheet.columns = [
      { header: 'Atividade', key: 'activity', width: 30 },
      { header: 'Hora (HH:MM)', key: 'time', width: 15 },
      { header: 'Data (AAAA-MM-DD)', key: 'date', width: 15 },
    ];

    // Adiciona linhas de exemplo
    worksheet.addRow({ activity: 'Café da Manhã', time: '08:00', date: new Date().toISOString().split('T')[0] });
    worksheet.addRow({ activity: 'Atividade Pedagógica', time: '09:00', date: new Date().toISOString().split('T')[0] });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modelo_cronograma.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const handleImport = async () => {
    if (!file || !studentId) return;

    setIsLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const worksheet = workbook.getWorksheet(1);
      
      if (!worksheet) throw new Error("Planilha vazia ou inválida.");

      const schedules: any[] = [];
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Pula cabeçalho

        // Lê as colunas: 1=Atividade, 2=Hora, 3=Data
        const activity = row.getCell(1).text;
        const time = row.getCell(2).text;
        let date = row.getCell(3).text;

        // Tratamento simples para data
        if (row.getCell(3).value instanceof Date) {
             date = (row.getCell(3).value as Date).toISOString().split('T')[0];
        }

        if (activity && time) {
          schedules.push({ activity, time, date });
        }
      });

      if (schedules.length === 0) throw new Error("Nenhum agendamento encontrado na planilha.");

      const { data, error } = await supabase.functions.invoke('import-schedule', {
        body: { student_id: studentId, schedules }
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || "Erro ao processar importação.");

      toast.success("Cronograma importado com sucesso!");
      setIsOpen(false);
      setFile(null);
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao importar cronograma.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Importar Planilha
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Cronograma</DialogTitle>
          <DialogDescription>
            Selecione uma planilha Excel (.xlsx) com as colunas: Atividade, Hora e Data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
             <Label>Modelo de Planilha</Label>
             <Button variant="ghost" size="sm" onClick={handleDownloadTemplate} className="gap-2 text-primary">
                <Download className="h-4 w-4" /> Baixar Modelo
             </Button>
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="spreadsheet">Arquivo</Label>
            <Input id="spreadsheet" type="file" accept=".xlsx" onChange={handleFileChange} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Importar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}