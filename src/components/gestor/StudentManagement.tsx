import { Dispatch, SetStateAction, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Edit, Save, Trash2, Upload, FileDown, Loader2, GraduationCap, X } from "lucide-react";
import { useStudents, Student } from "@/hooks/useStudents"; // Hook para buscar estudantes
import { useFileImport } from "@/hooks/useFileImport";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from 'xlsx';
import { ImportErrorsDialog } from "@/components/shared/ImportErrorsDialog.tsx";
import { useProfile } from "@/hooks/useProfile";
import { useUsers } from "@/hooks/useUsers"; // 1. Importa o hook de usuários
import { MultiSelect } from "@/components/ui/MultiSelect"; // 2. Importa o MultiSelect
import { Textarea } from "../ui/textarea";

const studentSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  status: z.enum(['ativo', 'inativo', 'aguardando']),
  class_name: z.string().optional().nullable(),
  period: z.enum(['Manhã', 'Tarde', 'Integral']).optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  medical_info: z.string().optional().nullable(), // CORREÇÃO: Nome do campo alinhado com o banco de dados
  caregiver_ids: z.array(z.string()).optional(), // 3. Adiciona os campos de vínculo ao schema
  guardian_ids: z.array(z.string()).optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentManagementProps {
  isDialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  editingStudent: Student | null;
  setEditingStudent: Dispatch<SetStateAction<Student | null>>;
}

export function StudentManagement({ isDialogOpen, setDialogOpen, editingStudent, setEditingStudent }: StudentManagementProps) {
  const { profile } = useProfile();
  const { students, isLoading, upsertStudent, deleteStudent } = useStudents(); // Hook de estudantes
  const { users: allUsers } = useUsers(); // Hook para buscar cuidadores e responsáveis

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

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    values: editingStudent ? {
      name: editingStudent.name,
      birth_date: editingStudent.birth_date,
      status: editingStudent.status,
      class_name: editingStudent.class_name || "",
      period: editingStudent.period || undefined,
      diagnosis: editingStudent.diagnosis || "",
      medical_info: editingStudent.medical_info || "", // CORREÇÃO: Nome do campo alinhado com o banco de dados
      caregiver_ids: (editingStudent.caregivers_students || []).map((cs: any) => cs.caregiver_id),
      guardian_ids: (editingStudent.guardians_students || []).map((gs: any) => gs.guardian_id),
    } : {
      name: "",
      birth_date: "",
      status: "ativo",
    },
  });

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      await upsertStudent.mutateAsync({ id: editingStudent?.id, ...data });
      setEditingStudent(null);
      setDialogOpen(false);
    } catch (error) {
      console.error('Falha ao salvar estudante:', error);
    }
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

  const handleDownloadTemplate = (format: 'csv' | 'xlsx') => {
    const headers = ["name", "birth_date", "status", "class_name", "period", "diagnosis", "medical_info"];
    const example = ["Exemplo Aluno", "2015-08-20", "ativo", "Turma A", "3º Ano", "Manhã", "TEA", "Alergia a amendoim"];
    
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
      const worksheet = XLSX.utils.aoa_to_sheet([headers, example]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Estudantes");
      XLSX.writeFile(workbook, "modelo_importacao_estudantes.xlsx");
    }
  };

  if (profile?.role !== 'gestor') {
    return null;
  }

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
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingStudent ? 'Editar Estudante' : 'Cadastrar Novo Estudante'}</DialogTitle>
                    <DialogDescription>Preencha os campos abaixo.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input id="name" {...register("name")} />
                      {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birth_date">Data de Nascimento *</Label>
                        <Input id="birth_date" type="date" {...register("birth_date")} />
                        {errors.birth_date && <p className="text-sm text-destructive">{errors.birth_date.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select onValueChange={(value) => reset({ ...watch(), status: value as any })} defaultValue={editingStudent?.status || 'ativo'}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                            <SelectItem value="aguardando">Aguardando</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label htmlFor="class_name">Turma</Label>
                        <Input id="class_name" {...register("class_name")} />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="period">Período</Label>
                         <Select onValueChange={(value) => reset({ ...watch(), period: value as any })} defaultValue={editingStudent?.period}>
                          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Manhã">Manhã</SelectItem>
                            <SelectItem value="Tarde">Tarde</SelectItem>
                            <SelectItem value="Integral">Integral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="diagnosis">Diagnóstico</Label>
                      <Input id="diagnosis" {...register("diagnosis")} />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="medical_info">Informações Médicas Relevantes</Label>
                      <Textarea id="medical_info" {...register("medical_info")} />
                    </div>
                    
                    {/* 4. Adiciona os campos de seleção ao formulário */}
                    <div className="space-y-2">
                      <Label htmlFor="guardian_ids">Responsáveis Vinculados</Label>
                      <MultiSelect
                        options={guardians.map(g => ({ value: g.id, label: g.name }))}
                        selected={watch('guardian_ids') || []}
                        onChange={(selected) => setValue('guardian_ids', selected)}
                        placeholder="Selecione os responsáveis..."
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caregiver_ids">Cuidadores Vinculados</Label>
                      <MultiSelect
                        options={caregivers.map(c => ({ value: c.id, label: c.name }))}
                        selected={watch('caregiver_ids') || []}
                        onChange={(selected) => setValue('caregiver_ids', selected)}
                        placeholder="Selecione os cuidadores..."
                        className="w-full"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <Button type="button" variant="ghost" onClick={() => handleDialogChange(false)}>Cancelar</Button>
                      <Button type="submit" disabled={upsertStudent.isPending}>
                        {editingStudent
                          ? (upsertStudent.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar</>)
                          : (upsertStudent.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...</> : <><UserPlus className="mr-2 h-4 w-4" /> Criar</>)
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
          {students.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
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
                ))}
              </TableBody>
            </Table>
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