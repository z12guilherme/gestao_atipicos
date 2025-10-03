import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Edit, Trash2, Upload, FileDown } from "lucide-react";
import { useStudents, Student } from "@/hooks/useStudents";
import { toast } from "sonner";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";

export function StudentManagement() {
  const { students, isLoading, createStudent, updateStudent, deleteStudent } = useStudents();
  const [isImportOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent = "name,birth_date,school_year,status,diagnosis,special_needs,additional_info\n" +
      "Exemplo Aluno,2010-05-15,5º Ano,ativo,TDAH,Apoio pedagógico,Gosta de desenhar";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importacao_estudantes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    if (!importFile) {
      toast.error("Por favor, selecione um arquivo CSV para importar.");
      return;
    }

    setIsImporting(true);
    Papa.parse(importFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const { data, error } = await supabase.functions.invoke('bulk-create-students', {
            body: results.data,
          });

          if (error) throw new Error(error.message);

          const { successCount, errorCount, errors } = data;

          if (errorCount > 0) {
            toast.warning(`${successCount} estudantes importados com sucesso.`, {
              description: `${errorCount} linhas continham erros. Detalhes: ${errors.map((e: any) => e.error).join('; ')}`,
              duration: 8000,
            });
          } else {
            toast.success(`${successCount} estudantes importados com sucesso!`);
          }

          // Invalida a query para recarregar a lista de estudantes
          // Assumindo que seu hook useStudents usa react-query
          // e a chave da query é ['students']
          updateStudent.queryClient.invalidateQueries({ queryKey: ['students'] });
          setImportOpen(false);
          setImportFile(null);
        } catch (e: any) {
          toast.error("Falha ao importar arquivo.", { description: e.message });
        } finally {
          setIsImporting(false);
        }
      },
      error: (error) => {
        toast.error("Erro ao processar o arquivo CSV.", { description: error.message });
        setIsImporting(false);
      }
    });
  };

  if (isLoading) {
    return <Card><CardContent className="p-6 text-center">Carregando estudantes...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciar Estudantes</CardTitle>
            <CardDescription>Cadastre e gerencie os estudantes da instituição.</CardDescription>
          </div>
          <div className="flex space-x-2">
            {/* Botão de Importar */}
            <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Importar</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importar Estudantes em Massa</DialogTitle>
                  <DialogDescription>
                    Envie um arquivo CSV para cadastrar múltiplos estudantes de uma vez.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    O arquivo deve conter as colunas: `name`, `birth_date`, `school_year`, `status`.
                    O status deve ser `ativo`, `inativo` ou `avaliando`.
                  </p>
                  <Button variant="secondary" size="sm" onClick={handleDownloadTemplate}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Baixar modelo CSV
                  </Button>
                  <div className="space-y-2">
                    <Label htmlFor="import-file">Arquivo CSV</Label>
                    <Input id="import-file" type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)} />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancelar</Button>
                  <Button onClick={handleImport} disabled={isImporting || !importFile}>
                    {isImporting ? "Importando..." : "Iniciar Importação"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Botão de Novo Estudante (exemplo) */}
            <Button><UserPlus className="mr-2 h-4 w-4" />Novo Estudante</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Ano Escolar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((student: Student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.school_year}</TableCell>
                <TableCell>{student.status}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}