import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; 
import { UserPlus, Edit, Save, Trash2, Upload, FileDown, Loader2, GraduationCap, X, Search, FileText, Eye, Link2, HeartPulse, UsersRound } from "lucide-react";
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
import { ImportErrorsDialog } from "@/components/shared/ImportErrorsDialog";
import { PdfViewerDialog } from "@/components/shared/PdfViewerDialog";
import { Textarea } from "../ui/textarea";
import { correlationLogger as logger } from "@/lib/correlation";
import { toast } from "sonner";
import { ApiError } from "@/lib/errors";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  // Estados para o novo modal de vínculo
  const [isLinkGuardianDialogOpen, setLinkGuardianDialogOpen] = useState(false);
  const [guardianSearchTerm, setGuardianSearchTerm] = useState("");
  const [tempSelectedGuardians, setTempSelectedGuardians] = useState<string[]>([]);
  // Estados para o novo modal de vínculo de cuidadores
  const [isLinkCaregiverDialogOpen, setLinkCaregiverDialogOpen] = useState(false);
  const [caregiverSearchTerm, setCaregiverSearchTerm] = useState("");
  const [tempSelectedCaregivers, setTempSelectedCaregivers] = useState<string[]>([]);
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

  // Assiste ao valor de 'guardian_ids' para usar como dependência estável no useMemo
  const watchedGuardianIds = form.watch('guardian_ids');
  const watchedCaregiverIds = form.watch('caregiver_ids');

  const availableGuardians = useMemo(() => {
    const linkedIds = watchedGuardianIds || [];
    return guardians
      .filter(g => !linkedIds.includes(g.id))
      .filter(g => g.name.toLowerCase().includes(guardianSearchTerm.toLowerCase()));
  }, [guardians, watchedGuardianIds, guardianSearchTerm]);

  const availableCaregivers = useMemo(() => {
    const linkedIds = watchedCaregiverIds || [];
    return caregivers
      .filter(c => !linkedIds.includes(c.id))
      .filter(c => c.name.toLowerCase().includes(caregiverSearchTerm.toLowerCase()));
  }, [caregivers, watchedCaregiverIds, caregiverSearchTerm]);

  const handleConfirmLinkGuardians = () => {
    const currentIds = form.getValues('guardian_ids') || [];
    form.setValue('guardian_ids', [...currentIds, ...tempSelectedGuardians], { shouldDirty: true });
    setLinkGuardianDialogOpen(false);
    setTempSelectedGuardians([]);
    setGuardianSearchTerm("");
    toast.info(`${tempSelectedGuardians.length} responsável(eis) pronto(s) para vincular. Salve as alterações do estudante para confirmar.`);
  };

  const handleConfirmLinkCaregivers = () => {
    const currentIds = form.getValues('caregiver_ids') || [];
    form.setValue('caregiver_ids', [...currentIds, ...tempSelectedCaregivers], { shouldDirty: true });
    setLinkCaregiverDialogOpen(false);
    setTempSelectedCaregivers([]);
    setCaregiverSearchTerm("");
    toast.info(`${tempSelectedCaregivers.length} cuidador(es) pronto(s) para vincular. Salve as alterações do estudante para confirmar.`);
  };


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
      <Card className="rounded-2xl border-border/60 shadow-card">
      <Dialog open={isLinkGuardianDialogOpen} onOpenChange={setLinkGuardianDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Responsáveis</DialogTitle>
            <DialogDescription>
              Busque e selecione os responsáveis para vincular a {editingStudent?.name || 'este estudante'}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar responsável..."
                value={guardianSearchTerm}
                onChange={(e) => setGuardianSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-64 border rounded-md">
              <div className="p-4 space-y-2">
                {availableGuardians.length > 0 ? availableGuardians.map(guardian => (
                  <div key={guardian.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`guardian-${guardian.id}`}
                      checked={tempSelectedGuardians.includes(guardian.id)}
                      onCheckedChange={(checked) => {
                        setTempSelectedGuardians(prev =>
                          checked
                            ? [...prev, guardian.id]
                            : prev.filter(id => id !== guardian.id)
                        );
                      }}
                    />
                    <Label htmlFor={`guardian-${guardian.id}`} className="font-normal">{guardian.name}</Label>
                  </div>
                )) : <p className="text-sm text-center text-muted-foreground py-4">Nenhum outro responsável encontrado.</p>}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setLinkGuardianDialogOpen(false)}>Cancelar</Button><Button onClick={handleConfirmLinkGuardians}>Confirmar Vínculo</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isLinkCaregiverDialogOpen} onOpenChange={setLinkCaregiverDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Cuidadores</DialogTitle>
            <DialogDescription>
              Busque e selecione os cuidadores para vincular a {editingStudent?.name || 'este estudante'}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cuidador..."
                value={caregiverSearchTerm}
                onChange={(e) => setCaregiverSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-64 border rounded-md">
              <div className="p-4 space-y-2">
                {availableCaregivers.length > 0 ? availableCaregivers.map(caregiver => (
                  <div key={caregiver.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`caregiver-${caregiver.id}`}
                      checked={tempSelectedCaregivers.includes(caregiver.id)}
                      onCheckedChange={(checked) => {
                        setTempSelectedCaregivers(prev =>
                          checked
                            ? [...prev, caregiver.id]
                            : prev.filter(id => id !== caregiver.id)
                        );
                      }}
                    />
                    <Label htmlFor={`caregiver-${caregiver.id}`} className="font-normal">{caregiver.name}</Label>
                  </div>
                )) : <p className="text-sm text-center text-muted-foreground py-4">Nenhum outro cuidador encontrado.</p>}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setLinkCaregiverDialogOpen(false)}>Cancelar</Button><Button onClick={handleConfirmLinkCaregivers}>Confirmar Vínculo</Button></DialogFooter>
        </DialogContent>
      </Dialog>
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
                  <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-glow-sm"><UserPlus className="mr-2 h-4 w-4" />Novo Estudante</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-2xl p-0 overflow-hidden border-border/60 shadow-card">
                  <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 px-6 py-5 border-b border-border/40 relative">
                    <div className="absolute top-2 right-4 p-4 opacity-10 pointer-events-none">
                      <GraduationCap className="w-16 h-16" />
                    </div>
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {editingStudent ? <Edit className="h-5 w-5 text-indigo-500" /> : <UserPlus className="h-5 w-5 text-indigo-500" />}
                        {editingStudent ? 'Editar Estudante' : 'Cadastrar Novo Estudante'}
                      </DialogTitle>
                      <DialogDescription>Preencha as informações detalhadas do estudante.</DialogDescription>
                    </DialogHeader>
                  </div>
                  <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
                      <section className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/70 dark:bg-slate-900/40">
                        <div className="mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <div className="rounded-lg bg-slate-200 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><UserPlus className="h-4 w-4" /></div>
                          <div><h3 className="text-sm font-bold">Dados do estudante</h3><p className="text-xs text-muted-foreground">Identificação e situação atual</p></div>
                        </div>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold">Nome Completo *</Label>
                        <Input id="name" {...form.register("name")} className="h-11 rounded-xl bg-white border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 transition-all" />
                        {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="birth_date" className="text-sm font-semibold">Data de Nascimento *</Label>
                          <Input id="birth_date" type="date" {...form.register("birth_date")} className="h-11 rounded-xl bg-white border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 transition-all" />
                          {form.formState.errors.birth_date && <p className="text-sm text-destructive">{form.formState.errors.birth_date.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status" className="text-sm font-semibold">Status *</Label>
                          <FormField
                            name="status"
                            control={form.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 transition-all"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="ativo">Ativo</SelectItem>
                                  <SelectItem value="inativo">Inativo</SelectItem>
                                  <SelectItem value="aguardando">Aguardando</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                      </section>

                      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/20">
                        <div className="mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                          <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/50"><GraduationCap className="h-4 w-4" /></div>
                          <div><h3 className="text-sm font-bold">Vínculo escolar</h3><p className="text-xs text-indigo-700/70 dark:text-indigo-300/70">Turma e período de estudo</p></div>
                        </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="class_name" className="text-sm font-semibold">Turma</Label>
                          <Input id="class_name" {...form.register("class_name")} className="h-11 rounded-xl bg-white border-indigo-100 shadow-sm dark:bg-slate-950 dark:border-indigo-900/60 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Ex: 2º Ano A" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="period" className="text-sm font-semibold">Período</Label>
                          <Controller
                            name="period"
                            control={form.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-indigo-100 shadow-sm dark:bg-slate-950 dark:border-indigo-900/60 focus:ring-2 focus:ring-primary/20 transition-all"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="Manhã">Manhã</SelectItem>
                                  <SelectItem value="Tarde">Tarde</SelectItem>
                                  <SelectItem value="Integral">Integral</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                      </section>

                      <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                        <div className="mb-4 flex items-center gap-2 text-amber-800 dark:text-amber-300">
                          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/50"><HeartPulse className="h-4 w-4" /></div>
                          <div><h3 className="text-sm font-bold">Saúde e acompanhamento</h3><p className="text-xs text-amber-800/70 dark:text-amber-300/70">Informações que ajudam no cuidado</p></div>
                        </div>
                      <div className="space-y-2">
                        <Label htmlFor="diagnosis" className="text-sm font-semibold">Diagnóstico</Label>
                        <Input id="diagnosis" {...form.register("diagnosis")} className="h-11 rounded-xl bg-white border-amber-100 shadow-sm dark:bg-slate-950 dark:border-amber-900/60 focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label htmlFor="medical_info" className="text-sm font-semibold">Informações Médicas Relevantes</Label>
                        <Textarea id="medical_info" {...form.register("medical_info")} className="min-h-[80px] rounded-xl bg-white border-amber-100 shadow-sm dark:bg-slate-950 dark:border-amber-900/60 focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label htmlFor="laudo_file" className="text-sm font-semibold">Laudo Médico (PDF)</Label>
                        {/* @ts-ignore - Verifica se existe laudo_url no estudante em edição */}
                        {editingStudent?.laudo_url ? (
                          <div className="flex items-center justify-between p-3 border border-amber-100 rounded-xl bg-white/80 dark:border-amber-900/60 dark:bg-slate-950/60">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium">Laudo Anexado</p>
                                <p className="text-xs text-muted-foreground">Documento PDF salvo</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button type="button" variant="outline" size="sm" onClick={handleViewLaudo} className="rounded-lg h-8">
                                <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver
                              </Button>
                              <Button type="button" variant="destructive" size="sm" onClick={handleRemoveLaudo} className="rounded-lg h-8">
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remover
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Input id="laudo_file" type="file" accept="application/pdf" {...form.register("laudo_file")} className="h-11 rounded-xl bg-white border-amber-100 shadow-sm dark:bg-slate-950 dark:border-amber-900/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 dark:file:bg-amber-900/50 dark:file:text-amber-200 transition-all cursor-pointer" />
                            {form.formState.errors.laudo_file && <p className="text-sm text-destructive">{form.formState.errors.laudo_file.message as string}</p>}
                          </>
                        )}
                      </div>
                      </section>

                      <section className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4 dark:border-teal-900/60 dark:bg-teal-950/20">
                        <div className="mb-4 flex items-center gap-2 text-teal-800 dark:text-teal-300">
                          <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-900/50"><UsersRound className="h-4 w-4" /></div>
                          <div><h3 className="text-sm font-bold">Rede de apoio</h3><p className="text-xs text-teal-800/70 dark:text-teal-300/70">Responsáveis e cuidadores vinculados</p></div>
                        </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Responsáveis</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setLinkGuardianDialogOpen(true)} className="h-7 text-xs rounded-lg text-primary hover:bg-primary/10"><Link2 className="mr-1.5 h-3 w-3" />Adicionar</Button>
                          </div>
                          <div className="rounded-xl border border-teal-100 p-3 min-h-[90px] bg-white/80 dark:border-teal-900/60 dark:bg-slate-950/60">
                            {form.watch('guardian_ids')?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {form.watch('guardian_ids').map(id => {
                                  const guardian = guardians.find(g => g.id === id);
                                  return (
                                    <Badge key={id} variant="outline" className="text-xs py-1 px-2 rounded-lg flex items-center gap-1.5 border-teal-200 bg-teal-100 text-teal-950 dark:border-teal-800 dark:bg-teal-900/50 dark:text-teal-100">
                                      {guardian?.name || 'Carregando...'}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentIds = form.getValues('guardian_ids') || [];
                                          form.setValue('guardian_ids', currentIds.filter(gid => gid !== id), { shouldDirty: true });
                                        }}
                                        className="rounded-full hover:bg-destructive/10 hover:text-destructive p-0.5 transition-colors"
                                      ><X className="h-3 w-3" /></button>
                                    </Badge>
                                  );
                                })}
                              </div>
                            ) : <p className="text-xs text-muted-foreground py-2 text-center">Nenhum responsável vinculado.</p>}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Cuidadores</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setLinkCaregiverDialogOpen(true)} className="h-7 text-xs rounded-lg text-primary hover:bg-primary/10"><Link2 className="mr-1.5 h-3 w-3" />Adicionar</Button>
                          </div>
                          <div className="rounded-xl border border-teal-100 p-3 min-h-[90px] bg-white/80 dark:border-teal-900/60 dark:bg-slate-950/60">
                            {form.watch('caregiver_ids')?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {form.watch('caregiver_ids').map(id => {
                                  const caregiver = caregivers.find(c => c.id === id);
                                  return (
                                    <Badge key={id} variant="outline" className="text-xs py-1 px-2 rounded-lg flex items-center gap-1.5 border-teal-200 bg-teal-100 text-teal-950 dark:border-teal-800 dark:bg-teal-900/50 dark:text-teal-100">
                                      {caregiver?.name || 'Carregando...'}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentIds = form.getValues('caregiver_ids') || [];
                                          form.setValue('caregiver_ids', currentIds.filter(cid => cid !== id), { shouldDirty: true });
                                        }}
                                        className="rounded-full hover:bg-destructive/10 hover:text-destructive p-0.5 transition-colors"
                                      ><X className="h-3 w-3" /></button>
                                    </Badge>
                                  );
                                })}
                              </div>
                            ) : <p className="text-xs text-muted-foreground py-2 text-center">Nenhum cuidador vinculado.</p>}
                          </div>
                        </div>
                      </div>
                      </section>

                    </div>
                    <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-muted/20 border-t border-border/40">
                      <Button type="button" variant="ghost" className="rounded-xl" onClick={() => handleDialogChange(false)}>Cancelar</Button>
                      <Button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-glow-sm" disabled={createStudent.isPending || updateStudent.isPending}>
                        {editingStudent
                          ? (updateStudent.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>)
                          : (createStudent.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...</> : <><UserPlus className="mr-2 h-4 w-4" /> Criar Estudante</>)
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
