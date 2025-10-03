import { Dispatch, SetStateAction, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Edit, Save, Trash2, Stethoscope, FileText, BadgeInfo, Upload, FileDown } from "lucide-react";
import { useStudents, Student } from "@/hooks/useStudents"; // Hook para buscar estudantes
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// Schema de validação ATUALIZADO com todos os seus campos
const studentSchema = z.object({
  name: z.string({ required_error: "O nome é obrigatório." }).trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
  birth_date: z.string({ required_error: "A data de nascimento é obrigatória." }).nonempty("Data de nascimento é obrigatória"),
  status: z.enum(['ativo', 'inativo', 'transferido'], { required_error: "O status é obrigatório." }),
  // Campos opcionais
  cpf: z.string().trim().max(14, "CPF inválido").optional().or(z.literal('')),
  class_name: z.string().trim().optional().or(z.literal('')),
  school_year: z.string().trim().optional().or(z.literal('')),
  diagnosis: z.string().trim().optional().or(z.literal('')),
  special_needs: z.string().trim().optional().or(z.literal('')),
  medical_info: z.string().trim().optional().or(z.literal('')),
  additional_info: z.string().trim().optional().or(z.literal('')),
});

type StudentFormData = z.infer<typeof studentSchema>;

// Função para calcular a idade
const calculateAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return '';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return `${age} anos`;
};

interface StudentManagementProps {
  isDialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  editingStudent: Student | null;
  setEditingStudent: Dispatch<SetStateAction<Student | null>>;
}

export function StudentManagement({ isDialogOpen, setDialogOpen, editingStudent, setEditingStudent }: StudentManagementProps) {

  const { students, isLoading, createStudent, updateStudent, deleteStudent } = useStudents();
  const queryClient = useQueryClient();
  const [isImportOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadCsvTemplate = () => {
    const csvContent = "name,birth_date,status,school_year,class_name,cpf,diagnosis,special_needs,medical_info,additional_info\n" +
      "Exemplo Aluno,2010-05-15,ativo,5º Ano,Turma A,123.456.789-00,TDAH,Apoio pedagógico,Alergia a amendoim,Gosta de desenhar";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importacao_estudantes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadXlsxTemplate = () => {
    const worksheetData = [
      ["name", "birth_date", "status", "school_year", "class_name", "cpf", "diagnosis", "special_needs", "medical_info", "additional_info"],
      ["Exemplo Aluno", "2010-05-15", "ativo", "5º Ano", "Turma A", "123.456.789-00", "TDAH", "Apoio pedagógico", "Alergia a amendoim", "Gosta de desenhar"]
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estudantes");
    // Gera o arquivo e força o download
    XLSX.writeFile(workbook, "modelo_importacao_estudantes.xlsx");
  };

  const handleImport = () => {
    if (!importFile) {
      toast.error("Por favor, selecione um arquivo CSV para importar.");
      return;
    }

    setIsImporting(true);

    const processData = async (data: any[]) => {
      try {
        // Filtra linhas que não têm um nome, que são provavelmente linhas vazias.
        const validData = data.filter(row => row.name && row.name.trim() !== '');
        if (validData.length === 0) {
          throw new Error("Nenhum dado válido encontrado no arquivo. Verifique se a coluna 'name' está preenchida.");
        }
        const { data: responseData, error } = await supabase.functions.invoke('bulk-create-students', {
          body: validData,
        });

        if (error) throw new Error(error.message);

        const { successCount, errorCount, errors } = responseData;

        if (errorCount > 0) {
          toast.warning(`${successCount} estudantes importados com sucesso.`, {
              description: `Falha em ${errorCount} linhas. Erros: ${errors.map((e: any) => e.error).join('; ')}`,
            duration: 8000,
          });
        } else {
          toast.success(`${successCount} estudantes importados com sucesso!`);
        }

        queryClient.invalidateQueries({ queryKey: ['students'] });
        setImportOpen(false);
        setImportFile(null);
      } catch (e: any) {
        toast.error("Falha ao importar arquivo.", { description: e.message });
      } finally {
        setIsImporting(false);
      }
    };

    if (importFile.type === 'text/csv' || importFile.name.endsWith('.csv')) {
      Papa.parse(importFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processData(results.data),
        error: (error) => {
          toast.error("Erro ao processar o arquivo CSV.", { description: error.message });
          setIsImporting(false);
        }
      });
    } else if (importFile.type.includes('spreadsheetml') || importFile.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        processData(json);
      };
      reader.onerror = (error) => {
        toast.error("Erro ao ler o arquivo XLSX.", { description: error.message });
        setIsImporting(false);
      };
      reader.readAsArrayBuffer(importFile);
    } else {
      toast.error("Formato de arquivo não suportado. Use CSV ou XLSX.");
      setIsImporting(false);
    }
  };
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      status: 'ativo', // Garante que o status sempre tenha um valor padrão
    }
  });

  // ATUALIZADO: Preenche todos os campos no formulário de edição
  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setValue("name", student.name);
    setValue("cpf", student.cpf || "");
    setValue("birth_date", student.birth_date || "");
    setValue("status", student.status);
    setValue("class_name", student.class_name || "");
    setValue("diagnosis", student.diagnosis || "");
    setValue("special_needs", student.special_needs || "");
    setValue("medical_info", student.medical_info || "");
    // O campo additional_info não está no formulário, então não é setado aqui.
    setDialogOpen(true);
  };
  
  const onSubmit = async (data: StudentFormData) => {
    try {
      if (editingStudent) {
        await updateStudent.mutateAsync({ id: editingStudent.id, ...data });
      } else {
        await createStudent.mutateAsync(data);
      }
      reset();
      setEditingStudent(null);
      setDialogOpen(false);
    } catch (error) {
      console.error('Falha ao salvar estudante:', error);
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {
      reset();
      setEditingStudent(null);
    }
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
              <CardDescription>Cadastre e gerencie informações dos estudantes</CardDescription>
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
                      As colunas obrigatórias são: `name`, `birth_date`, `status`.
                      O status deve ser `ativo`, `inativo` ou `transferido`.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={handleDownloadCsvTemplate}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Baixar modelo CSV
                      </Button>
                      <Button variant="secondary" size="sm" onClick={handleDownloadXlsxTemplate}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Baixar modelo XLSX
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="import-file">Arquivo (CSV ou XLSX)</Label>
                      <Input id="import-file" type="file" accept=".csv,.xlsx" onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)} />
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

              <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingStudent(null);
                    setDialogOpen(true);
                  }}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo Estudante
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingStudent ? 'Editar Estudante' : 'Cadastrar Novo Estudante'}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input id="name" {...register("name")} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="birth_date">Data de Nascimento *</Label>
                            <Input id="birth_date" type="date" {...register("birth_date")} />
                            {errors.birth_date && <p className="text-sm text-destructive">{errors.birth_date.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" {...register("cpf")} placeholder="000.000.000-00" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="class_name">Turma</Label>
                            <Input id="class_name" {...register("class_name")} placeholder="Ex: 1º Ano A" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            {/* Adicionamos o registro do campo status aqui */}
                            <Select onValueChange={(value) => setValue("status", value as any)} defaultValue={editingStudent?.status || 'ativo'}>
                                <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                    <SelectItem value="transferido">Transferido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="diagnosis"><FileText className="inline mr-2 h-4 w-4"/>Diagnóstico</Label>
                        <Textarea id="diagnosis" {...register("diagnosis")} placeholder="Descreva o diagnóstico, se houver"/>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="special_needs"><BadgeInfo className="inline mr-2 h-4 w-4"/>Necessidades Especiais</Label>
                        <Textarea id="special_needs" {...register("special_needs")} placeholder="Descreva as necessidades especiais do estudante"/>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="medical_info"><Stethoscope className="inline mr-2 h-4 w-4"/>Informações Médicas Adicionais</Label>
                        <Textarea id="medical_info" {...register("medical_info")} placeholder="Alergias, medicamentos, contatos de emergência..."/>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => handleDialogChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={createStudent.isPending || updateStudent.isPending}>
                            {editingStudent 
                                ? <><Save className="mr-2 h-4 w-4" />{updateStudent.isPending ? 'Salvando...' : 'Salvar Alterações'}</>
                                : <><UserPlus className="mr-2 h-4 w-4" />{createStudent.isPending ? 'Criando...' : 'Criar Estudante'}</>
                            }
                        </Button>
                    </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.class_name || 'Não definida'}</TableCell>
                <TableCell><Badge variant={student.status === 'ativo' ? 'default' : 'secondary'}>{student.status}</Badge></TableCell>
                <TableCell>{calculateAge(student.birth_date)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(student)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar estudante</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Isso excluirá permanentemente o estudante e seus dados de nossos servidores.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteStudent.mutate(student.id)} disabled={deleteStudent.isPending}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}