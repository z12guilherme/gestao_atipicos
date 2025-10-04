import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Edit, Save, Trash2, Upload, FileDown, Loader2, Users2 } from "lucide-react";
import { useUsers, User } from "@/hooks/useUsers";
import { useStudents } from "@/hooks/useStudents";
import { useFileImport } from "@/hooks/useFileImport";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from 'xlsx';
import { ImportErrorsDialog } from "@/components/shared/ImportErrorsDialog.tsx";
import { useProfile } from "@/hooks/useProfile";
import { MultiSelect } from "@/components/ui/MultiSelect";

const guardianSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório"),
  email: z.string().trim().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
  phone: z.string().trim().optional(),
  student_ids: z.array(z.string()).default([]),
});

type GuardianFormData = z.infer<typeof guardianSchema>;

export function GuardianManagement() {
  const { profile } = useProfile();
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers();
  const { students } = useStudents();
  const guardians = users.filter(u => u.role === 'responsavel');

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<User | null>(null);

  const {
    isImportOpen, setImportOpen,
    importFile, setImportFile,
    isImporting,
    importErrors,
    isErrorsDialogOpen, setErrorsDialogOpen,
    handleImport,
  } = useFileImport({ supabaseFunction: 'bulk-create-users', invalidateQueryKey: 'users', entityName: 'responsáveis' });

  const currentSchema = useMemo(() => {
    return editingGuardian ? guardianSchema.omit({ password: true }) : guardianSchema;
  }, [editingGuardian]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<GuardianFormData>({
    resolver: zodResolver(currentSchema),
  });

  const handleOpenEditModal = (guardian: User) => {
    setEditingGuardian(guardian);
    reset({
      name: guardian.name,
      email: guardian.email,
      phone: guardian.phone || "",
      student_ids: guardian.student_ids || [],
    });
    setDialogOpen(true);
  };

  const handleDialogChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {
      reset();
      setEditingGuardian(null);
    }
  };

  const onSubmit = async (data: GuardianFormData) => {
    const { student_ids, ...profileData } = data;
    const payload = { ...profileData, role: 'responsavel' };
    if (editingGuardian) {
      await updateUser.mutateAsync({ id: editingGuardian.id, profileData: payload, student_ids });
    } else {
      await createUser.mutateAsync({ ...payload, student_ids });
    }
    handleDialogChange(false);
  };

  const handleDownloadTemplate = (format: 'csv' | 'xlsx') => {
    const headers = ["name", "email", "password", "phone"];
    const example = ["Exemplo Responsável", "responsavel@email.com", "senhaSegura123", "(99) 99999-9999"];
    if (format === 'csv') {
      const csvContent = [headers.join(','), example.join(',')].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "modelo_importacao_responsaveis.csv";
      link.click();
    } else {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, example]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Responsáveis");
      XLSX.writeFile(workbook, "modelo_importacao_responsaveis.xlsx");
    }
  };

  if (profile?.role !== 'gestor') return null;
  if (isLoading) return <Card><CardContent className="p-6 text-center">Carregando responsáveis...</CardContent></Card>;

  return (
    <>
      <ImportErrorsDialog isOpen={isErrorsDialogOpen} onOpenChange={setErrorsDialogOpen} errors={importErrors} fileName={importFile?.name || ''} />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Responsáveis</CardTitle>
              <CardDescription>Adicione, edite e importe os responsáveis pelos estudantes.</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild><Button variant="outline"><Upload className="mr-2 h-4 w-4" />Importar</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Importar Responsáveis</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">As colunas obrigatórias são: `name`, `email`, `password`. A coluna `role` será definida como 'responsavel' automaticamente.</p>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleDownloadTemplate('csv')}><FileDown className="mr-2 h-4 w-4" />Baixar CSV</Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDownloadTemplate('xlsx')}><FileDown className="mr-2 h-4 w-4" />Baixar XLSX</Button>
                    </div>
                    <Input id="import-file" type="file" accept=".csv,.xlsx" onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)} />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancelar</Button>
                    <Button onClick={() => handleImport({ role: 'responsavel' })} disabled={isImporting || !importFile}>{isImporting ? "Importando..." : "Importar"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" />Novo Responsável</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingGuardian ? 'Editar Responsável' : 'Novo Responsável'}</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input {...register("name")} placeholder="Nome Completo *" />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    <Input {...register("email")} placeholder="Email *" type="email" disabled={!!editingGuardian} />{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    {!editingGuardian && <><Input {...register("password")} placeholder="Senha *" type="password" />{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}</>}
                    <Input {...register("phone")} placeholder="Telefone" />
                    <div className="space-y-2">
                      <Label>Estudantes Vinculados</Label>
                      <MultiSelect options={students.map(s => ({ value: s.id, label: s.name }))} selected={watch('student_ids') || []} onChange={(selected) => setValue('student_ids', selected)} placeholder="Selecione..." />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="ghost" onClick={() => handleDialogChange(false)}>Cancelar</Button>
                      <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>{createUser.isPending || updateUser.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Salvar</>}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {guardians.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Estudantes Vinculados</TableHead><TableHead>Contato</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {guardians.map((guardian) => (
                  <TableRow key={guardian.id}>
                    <TableCell className="font-medium">{guardian.name}</TableCell>
                    <TableCell>{(guardian.student_ids || []).length}</TableCell>
                    <TableCell>{guardian.phone || guardian.email}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(guardian)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir este responsável? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteUser.mutate(guardian.id)} disabled={deleteUser.isPending}>Excluir</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12"><Users2 className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">Nenhum responsável encontrado</h3><p className="mt-2 text-sm text-muted-foreground">Cadastre um novo responsável para vê-lo aqui.</p></div>
          )}
        </CardContent>
      </Card>
    </>
  );
}