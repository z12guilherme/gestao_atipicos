import { Dispatch, SetStateAction, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Edit, Save, Trash2, Upload, FileDown, Loader2, Users2, KeyRound } from "lucide-react";
import { useUsers, User } from "@/hooks/useUsers"; // Hook para buscar usuários
import { useFileImport } from "@/hooks/useFileImport";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ExcelJS from 'exceljs';
import { ImportErrorsDialog } from "@/components/shared/ImportErrorsDialog.tsx";
import { useProfile } from "@/hooks/useProfile";

// Schema base para os dados do perfil, sem email e senha
const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  cpf: z.preprocess((val) => (typeof val === 'number' ? String(val) : val), z.string().trim().max(14, "CPF inválido").optional().nullable()),
  phone: z.preprocess((val) => (typeof val === 'number' ? String(val) : val), z.string().trim().max(20, "Telefone inválido").optional()),
  role: z.enum(['gestor', 'cuidador', 'responsavel']),
  function_title: z.string().trim().max(100, "Função muito longa").optional(),
  work_schedule: z.string().trim().max(500, "Horário muito longo").optional(),
})

// Schema para criar um novo usuário (email e senha são obrigatórios)
const createUserSchema = profileSchema.extend({
  email: z.string().trim().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa"),
})

// Schema para editar um usuário (email e senha não são editáveis aqui)
const updateUserSchema = profileSchema;

type UserFormData = z.infer<typeof createUserSchema>;

interface UserManagementProps {
  isDialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  editingUser: User | null;
  setEditingUser: Dispatch<SetStateAction<User | null>>;
}

export function UserManagement({ isDialogOpen, setDialogOpen, editingUser, setEditingUser }: UserManagementProps) {

  const { profile } = useProfile();
  const { users, isLoading, createUser, updateUser, deleteUser, sendPasswordReset } = useUsers();
  const {
    isImportOpen, setImportOpen,
    importFile, setImportFile,
    isImporting,
    importErrors,
    isErrorsDialogOpen, setErrorsDialogOpen, 
    handleImport,
  } = useFileImport({ supabaseFunction: 'bulk-create-users', invalidateQueryKey: 'users', entityName: 'usuários' });

  const currentSchema = useMemo(() => (editingUser ? updateUserSchema : createUserSchema), [editingUser]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: { name: "", email: "", password: "", role: "responsavel" },
  });

  // Efeito para resetar o formulário quando o usuário a ser editado muda.
  useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser.name,
        role: editingUser.role,
        cpf: editingUser.cpf || "",
        phone: editingUser.phone || "",
        function_title: editingUser.function_title || "",
        work_schedule: editingUser.work_schedule || "",
      });
    } else {
      reset({ name: "", email: "", password: "", role: "responsavel" });
    }
  }, [editingUser, reset]);

  const selectedRole = watch("role");

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };
  
  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({ id: editingUser.id, profileData: data });
      } else {
        await createUser.mutateAsync(data);
      }
      setEditingUser(null);
      setDialogOpen(false);
    } catch (error) {
      console.error('Falha ao salvar usuário:', error);
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {      
      setEditingUser(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = { gestor: 'destructive', cuidador: 'default', responsavel: 'secondary', professor: 'outline' };
    const labels = { gestor: 'Gestor', cuidador: 'Cuidador', responsavel: 'Responsável' };
    return <Badge variant={variants[role as keyof typeof variants] || 'default'}>{labels[role as keyof typeof labels] || role}</Badge>;
  };
  
  const handleDownloadCsvTemplate = () => {
    const csvContent = "name,email,password,role,cpf,phone,function_title,work_schedule\r\n" + // Coluna student_ids removida
      "Exemplo Cuidador,cuidador@email.com,senhaSegura123,cuidador,123.456.789-00,(99) 99999-9999,Cuidador de Apoio,Seg-Sex 8h-17h";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importacao_usuarios.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadXlsxTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Usuários");
    
    // Configura colunas com formato de Texto para evitar que CPF/Telefone virem números
    worksheet.columns = [
      { header: "name", key: "name", width: 30 },
      { header: "email", key: "email", width: 30 },
      { header: "password", key: "password", width: 20 },
      { header: "role", key: "role", width: 15 },
      { header: "cpf", key: "cpf", width: 20, style: { numFmt: '@' } }, // Força formato Texto
      { header: "phone", key: "phone", width: 20, style: { numFmt: '@' } }, // Força formato Texto
      { header: "function_title", key: "function_title", width: 20 },
      { header: "work_schedule", key: "work_schedule", width: 20 },
    ];

    // Adiciona linha de exemplo
    worksheet.addRow({ name: "Exemplo Cuidador", email: "cuidador@email.com", password: "senhaSegura123", role: "cuidador", cpf: "123.456.789-00", phone: "(99) 99999-9999", function_title: "Cuidador de Apoio", work_schedule: "Seg-Sex 8h-17h" });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modelo_importacao_usuarios.xlsx";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Adiciona uma verificação de segurança na entrada do componente
  if (profile?.role !== 'gestor') {
    return null; // Ou uma mensagem de "Acesso Negado"
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
            <CardTitle>Gerenciar Usuários</CardTitle>
            <CardDescription>Cadastre e gerencie funcionários, cuidadores e responsáveis</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Importar</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importar Usuários em Massa</DialogTitle>
                  <DialogDescription>
                    Envie um arquivo CSV para cadastrar múltiplos usuários de uma vez.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    As colunas obrigatórias são: `name`, `email`, `password`, `role`.
                    O perfil (`role`) deve ser `gestor`, `cuidador`, `responsavel` ou `professor`.
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
                    <Label htmlFor="import-file">Arquivo CSV</Label>
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

            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
              handleDialogChange(isOpen);
            }}>
              <DialogTrigger asChild>
                <Button><UserPlus className="mr-2 h-4 w-4" />Novo Usuário</Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</DialogTitle>
                <DialogDescription>Preencha os campos abaixo para {editingUser ? 'atualizar o perfil do' : 'criar um novo'} usuário.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {!editingUser && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" autoComplete="email" {...register("email")} />
                      {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha *</Label>
                      <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
                      {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Tipo de Perfil *</Label>
                    <Select onValueChange={(value) => setValue("role", value as any, { shouldValidate: true })} value={watch('role')}>
                        <SelectTrigger><SelectValue placeholder="Selecione o perfil" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gestor">Gestor</SelectItem>
                            <SelectItem value="cuidador">Cuidador</SelectItem>
                            <SelectItem value="responsavel">Responsável</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Aqui você pode adicionar de volta os campos condicionais para 'cuidador' se precisar */}
                {selectedRole === 'cuidador' && (
                  <>
                    <div className="space-y-2">
                        <Label htmlFor="function_title">Função/Cargo</Label>
                        <Input id="function_title" {...register("function_title")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="work_schedule">Horário de Trabalho</Label>
                        <Input id="work_schedule" {...register("work_schedule")} />
                    </div>
                  </>
                )}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => handleDialogChange(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
                    {editingUser
                      ? (updateUser.isPending
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                        : <><Save className="mr-2 h-4 w-4" /> Salvar</>)
                      : (createUser.isPending
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...</>
                        : <><UserPlus className="mr-2 h-4 w-4" /> Criar</>)
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
        {users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email || 'N/A'}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(user)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!user.email}><KeyRound className="h-4 w-4 text-yellow-600" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Redefinir Senha</AlertDialogTitle><AlertDialogDescription>Um e-mail será enviado para **{user.email}** com instruções para criar uma nova senha. Deseja continuar?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => sendPasswordReset?.mutate(user.email!)} disabled={sendPasswordReset?.isPending ?? false}>{sendPasswordReset?.isPending ? 'Enviando...' : 'Enviar E-mail'}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário e seus dados de nossos servidores.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteUser?.mutate(user.user_id)} disabled={deleteUser?.isPending ?? false}>{deleteUser?.isPending ? 'Excluindo...' : 'Excluir'}</AlertDialogAction>
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
            <Users2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum usuário encontrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">Comece cadastrando um novo usuário para vê-lo aqui.</p>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}