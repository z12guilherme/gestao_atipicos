import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Edit, Save, Trash2, Upload, FileDown, Loader2, GraduationCap, X, Search, FileText, Eye } from "lucide-react";
import { useStudents, Student } from "@/hooks/useStudents";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useFileImport } from "@/hooks/useFileImport";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { z, ZodError } from "zod";
import ExcelJS from 'exceljs';
import { useUsers } from "@/hooks/useUsers";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { ImportErrorsDialog } from "@/components/shared/ImportErrorsDialog";
import { PdfViewerDialog } from "@/components/shared/PdfViewerDialog";
import { Textarea } from "../ui/textarea";
import { correlationLogger as logger } from "@/lib/correlation";
import { toast } from "sonner";
import { ApiError } from "@/lib/errors";
import { useQueryClient } from "@tanstack/react-query";

const studentSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  status: z.enum(['ativo', 'inativo', 'aguardando']),
  class_name: z.string().optional().nullable(),
  period: z.enum(['Manhã', 'Tarde', 'Integral']).optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  medical_info: z.string().optional().nullable(),
  guardian_ids: z.array(z.string()).optional(),
  caregiver_ids: z.array(z.string()).optional(),
  laudo_file: z
    .any()
    .refine((files) => !files || files.length === 0 || files[0]?.type === 'application/pdf', {
      message: "Apenas arquivos PDF são permitidos.",
    })
    .optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentManagementProps {
  isDialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  editingStudent: Student | null;
  setEditingStudent: Dispatch<SetStateAction<Student | null>>;
}

export function StudentManagement({ isDialogOpen, setDialogOpen, editingStudent, setEditingStudent }: StudentManagementProps) {
  const { students, isLoading, createStudent, updateStudent, deleteStudent } = useStudents();
  const queryClient = useQueryClient();
  const { users: allUsers } = useUsers();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  // Estado para o modal do PDF
  const [isPdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);

  const caregivers = useMemo(() => allUsers.filter(u => u.role === 'cuidador'), [allUsers]);
  const guardians = useMemo(() => allUsers.filter(u => u.role === 'responsavel'), [allUsers]);

  const {
    isImportOpen, setImportOpen,
    importFile, setImportFile,
    isImporting,
    importErrors,
    isErrorsDialogOpen, setErrorsDialogOpen,
    handleImport,
  } = useFileImport({ supabaseFunction: 'bulk-create-students', invalidateQueryKey: 'students', entityName: 'estudantes' }); 
  
  // Lógica de Filtros e Ordenação
  const uniqueClasses = useMemo(() => {
    const classes = students
      .map(s => s.class_name ? s.class_name.replace(/\s+/g, ' ').trim() : "")
      .filter((c): c is string => !!c && c !== "");
    return Array.from(new Set(classes)).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const normalizedClass = student.class_name ? student.class_name.replace(/\s+/g, ' ').trim() : "";
        const matchesClass = selectedClass === "all" || normalizedClass === selectedClass;
        return matchesSearch && matchesClass;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchTerm, selectedClass]);


  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    values: editingStudent ? {
      name: editingStudent.name,
      birth_date: editingStudent.birth_date,
      status: editingStudent.status,
      class_name: editingStudent.class_name || "",
      period: editingStudent.period || undefined,
      diagnosis: editingStudent.diagnosis || "",
      medical_info: editingStudent.medical_info || "",
      // Carrega os IDs dos vínculos existentes para o formulário
      guardian_ids: (editingStudent.guardians_students || []).map((gs: any) => gs.guardian.id),
      caregiver_ids: (editingStudent.caregivers_students || []).map((cs: any) => cs.caregiver.id),
    } : {
      name: "",
      birth_date: "",
      status: "ativo",
      guardian_ids: [],
      caregiver_ids: [],
    },
  });

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const onSubmit = async (data: StudentFormData) => {
    const action = editingStudent ? "atualizar" : "criar";
    const studentIdForLog = editingStudent ? editingStudent.id : "new";
    
    // Separa o arquivo do restante dos dados
    const { laudo_file, ...studentData } = data;
    const file = laudo_file && laudo_file.length > 0 ? laudo_file[0] : null;

    logger.info({ student: studentData, action }, `Tentando ${action} estudante.`);

    try {
      const payload = {
        ...studentData,
        id: editingStudent ? editingStudent.id : undefined,
      };

      // Garante que o token de sessão mais recente seja usado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sua sessão expirou. Por favor, faça login novamente.");
        throw new ApiError("Sessão de usuário não encontrada.", 401);
      }

      // A lógica de negócio foi movida para uma Edge Function segura e transacional.
      const { data: result, error } = await supabase.functions.invoke('upsert-student', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: payload,
      });

      if (error) {
        throw new ApiError(error.message, 500, { context: error.context });
      }

      // Lógica de Upload do Laudo
      const studentId = editingStudent ? editingStudent.id : result?.id;

      if (file && studentId) {
        toast.info("Enviando laudo...");
        const filePath = `${studentId}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('laudos')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { error: updateError } = await supabase
          .from('students')
          .update({ laudo_url: filePath })
          .eq('id', studentId);

        if (updateError) throw updateError;
        
        toast.success("Laudo enviado com sucesso!");
      }

      const successMessage = editingStudent ? "Estudante atualizado com sucesso!" : "Estudante criado com sucesso!";
      toast.success(successMessage);
      logger.info({ studentId: studentIdForLog, studentData: data }, successMessage);

      setEditingStudent(null);
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro detalhado ao salvar estudante:", error); // Log explícito para debug
      logger.error({ err: error, studentData: data }, `Falha ao ${action} estudante.`);
      toast.error(`Erro ao ${action} estudante. Por favor, tente novamente.`);
    }
  };

  const handleRemoveLaudo = async () => {
    // @ts-ignore - laudo_url pode não estar na tipagem Student ainda
    if (!editingStudent?.laudo_url || !editingStudent.id) return;

    try {
      toast.info("Removendo laudo...");
      
      // 1. Remove do Storage
      // @ts-ignore
      const { error: storageError } = await supabase.storage
        .from('laudos')
        .remove([editingStudent.laudo_url]);

      if (storageError) throw storageError;

      // 2. Atualiza o Banco de Dados
      const { error: dbError } = await supabase
        .from('students')
        .update({ laudo_url: null })
        .eq('id', editingStudent.id);

      if (dbError) throw dbError;

      toast.success("Laudo removido com sucesso!");
      // @ts-ignore - Atualiza estado local e invalida query
      setEditingStudent((prev) => prev ? { ...prev, laudo_url: null } : null);
      queryClient.invalidateQueries({ queryKey: ['students'] });
    } catch (error: any) {
      console.error("Erro ao remover laudo:", error);
      toast.error("Erro ao remover laudo.");
    }
  };

  const handleViewLaudo = () => {
    // @ts-ignore - laudo_url pode não estar na tipagem Student ainda
    setPdfPath(editingStudent?.laudo_url || null);
    setPdfViewerOpen(true);
  };

  const handleDialogChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {
      setEditingStudent(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = { ativo: 'default', inativo: 'destructive', aguardando: 'secondary' };
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    const headers = ["name", "birth_date", "status", "class_name", "period", "diagnosis", "medical_info"];
    const example = ["Exemplo Aluno", "2015-08-20", "ativo", "Turma A", "Manhã", "TEA", "Alergia a amendoim"];

    if (format === 'csv') {
      const csvContent = [headers.join(','), example.join(',')].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "modelo_importacao_estudantes.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Estudantes");
      worksheet.addRow(headers);
      worksheet.addRow(example);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "modelo_importacao_estudantes.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <PdfViewerDialog
        isOpen={isPdfViewerOpen}
        onOpenChange={setPdfViewerOpen}
        filePath={pdfPath}
        fileName={`Laudo de ${editingStudent?.name || 'Estudante'}`}
      />
      <ImportErrorsDialog
        isOpen={isErrorsDialogOpen}
        onOpenChange={setErrorsDialogOpen}
        errors={importErrors}
        fileName={importFile?.name || ''}
      />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Estudantes</CardTitle>
              <CardDescription>Cadastre e gerencie os estudantes da instituição.</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Importar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importar Estudantes em Massa</DialogTitle>
                    <DialogDescription>Envie um arquivo para cadastrar múltiplos estudantes.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      As colunas obrigatórias são: `name`, `birth_date`, `status`.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleDownloadTemplate('csv')}>
                        <FileDown className="mr-2 h-4 w-4" /> Baixar modelo CSV
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDownloadTemplate('xlsx')}>
                        <FileDown className="mr-2 h-4 w-4" /> Baixar modelo XLSX
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
                      {isImporting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importando...</> : "Iniciar Importação"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <Button><UserPlus className="mr-2 h-4 w-4" />Novo Estudante</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-[95vw]">
                  <DialogHeader>
                    <DialogTitle>{editingStudent ? 'Editar Estudante' : 'Cadastrar Novo Estudante'}</DialogTitle>
                    <DialogDescription>Preencha os campos abaixo.</DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input id="name" {...form.register("name")} />
                        {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birth_date">Data de Nascimento *</Label>
                        <Input id="birth_date" type="date" {...form.register("birth_date")} />
                        {form.formState.errors.birth_date && <p className="text-sm text-destructive">{form.formState.errors.birth_date.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <FormField
                          name="status"
                          control={form.control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ativo">Ativo</SelectItem>
                                <SelectItem value="inativo">Inativo</SelectItem>
                                <SelectItem value="aguardando">Aguardando</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label htmlFor="class_name">Turma</Label>
                        <Input id="class_name" {...form.register("class_name")} /> 
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="period">Período</Label>
                        <Controller
                          name="period"
                          control={form.control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Manhã">Manhã</SelectItem>
                                <SelectItem value="Tarde">Tarde</SelectItem>
                                <SelectItem value="Integral">Integral</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="diagnosis">Diagnóstico</Label>
                      <Input id="diagnosis" {...form.register("diagnosis")} />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="medical_info">Informações Médicas Relevantes</Label>
                      <Textarea id="medical_info" {...form.register("medical_info")} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="laudo_file">Laudo Médico (PDF)</Label>
                      {/* @ts-ignore - Verifica se existe laudo_url no estudante em edição */}
                      {editingStudent?.laudo_url ? (
                        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/40">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900/30">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Laudo Anexado</p>
                              <p className="text-xs text-muted-foreground">PDF disponível</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button type="button" variant="outline" size="sm" onClick={handleViewLaudo} title="Visualizar Laudo">
                              <Eye className="h-4 w-4 mr-2" /> Visualizar
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={handleRemoveLaudo}>
                              <Trash2 className="h-4 w-4 mr-2" /> Remover
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Input id="laudo_file" type="file" accept="application/pdf" {...form.register("laudo_file")} />
                          {form.formState.errors.laudo_file && <p className="text-sm text-destructive">{form.formState.errors.laudo_file.message as string}</p>}
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guardian_ids">Responsáveis Vinculados</Label>
                      <MultiSelect
                        options={guardians.map(g => ({ value: g.id, label: g.name }))}
                        selected={form.watch('guardian_ids') || []}
                        onChange={(selected) => form.setValue('guardian_ids', selected)}
                        placeholder="Selecione os responsáveis..."
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caregiver_ids">Cuidadores Vinculados</Label>
                      <MultiSelect
                        options={caregivers.map(c => ({ value: c.id, label: c.name }))}
                        selected={form.watch('caregiver_ids') || []}
                        onChange={(selected) => form.setValue('caregiver_ids', selected)}
                        placeholder="Selecione os cuidadores..."
                        className="w-full"
                      />
                    </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
                      <Button type="button" variant="ghost" onClick={() => handleDialogChange(false)}>Cancelar</Button>
                      <Button type="submit" disabled={createStudent.isPending || updateStudent.isPending}>
                        {editingStudent
                          ? (updateStudent.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar</>)
                          : (createStudent.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...</> : <><UserPlus className="mr-2 h-4 w-4" /> Criar</>)
                        }
                      </Button>
                    </div>
                  </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {/* Filtros e Busca movidos para o cabeçalho */}
          {students.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar por Turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Turmas</SelectItem>
                  {uniqueClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-auto custom-scrollbar">
          {students.length > 0 ? (
            <div className="relative border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.class_name || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(student)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Isso excluirá permanentemente o estudante.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteStudent.mutate(student.id)} disabled={deleteStudent.isPending}>
                              {deleteStudent.isPending ? 'Excluindo...' : 'Excluir'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhum estudante encontrado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
              </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum estudante encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">Comece cadastrando um novo estudante para vê-lo aqui.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}