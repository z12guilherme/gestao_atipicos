import { Dispatch, SetStateAction, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Edit, Save, Trash2, Upload, FileDown } from "lucide-react";
import { useUsers, User } from "@/hooks/useUsers"; // Hook para buscar usuários
import { useForm } from "react-hook-form";
import { useStudents } from "@/hooks/useStudents"; // Hook para buscar estudantes
import { Check, ChevronsUpDown } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Papa from "papaparse";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

// Schema base para os dados do perfil, sem email e senha
const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  cpf: z.string().trim().max(14, "CPF inválido").optional(),
  phone: z.string().trim().max(20, "Telefone inválido").optional(),
  role: z.enum(['gestor', 'cuidador', 'responsavel']),
  function_title: z.string().trim().max(100, "Função muito longa").optional(),
  work_schedule: z.string().trim().max(500, "Horário muito longo").optional(),
  student_ids: z.array(z.string()).optional(), // Para vincular estudantes
});

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

  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers();
  const { students } = useStudents();
  const queryClient = useQueryClient();
  
  const [isImportOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  // LINHA CORRIGIDA
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(editingUser ? updateUserSchema : createUserSchema),
  });

  const selectedRole = watch("role");

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setValue("name", user.name);
    setValue("role", user.role);
    setValue("cpf", user.cpf || "");
    setValue("phone", user.phone || "");
    setValue("function_title", user.function_title || "");
    setValue("work_schedule", user.work_schedule || "");
    setDialogOpen(true);
  };
  
  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        // Na edição, não passamos email/senha, apenas os dados do perfil
        await updateUser.mutateAsync({ id: editingUser.id, ...data });
      } else {
        await createUser.mutateAsync(data);
      }
      reset();
      setEditingUser(null);
      setDialogOpen(false);
    } catch (error) {
      console.error('Falha ao salvar usuário:', error);
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {
      reset();
      setEditingUser(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = { gestor: 'destructive', cuidador: 'default', responsavel: 'secondary' };
    const labels = { gestor: 'Gestor', cuidador: 'Cuidador', responsavel: 'Responsável' };
    return <Badge variant={variants[role as keyof typeof variants] as any}>{labels[role as keyof typeof labels]}</Badge>;
  };
  
  const handleDownloadCsvTemplate = () => {
    const csvContent = "name,email,password,role,cpf,phone\nExemplo Nome,exemplo@email.com,senhaSegura123,cuidador,123.456.789-00,(99) 99999-9999";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importacao_usuarios.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadXlsxTemplate = () => {
    const worksheetData = [
      ["name", "email", "password", "role", "cpf", "phone"],
      ["Exemplo Nome", "exemplo@email.com", "senhaSegura123", "cuidador", "123.456.789-00", "(99) 99999-9999"]
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuários");
    // Gera o arquivo e força o download
    XLSX.writeFile(workbook, "modelo_importacao_usuarios.xlsx");
  };

  const handleImport = () => {
    if (!importFile) {
      toast.error("Por favor, selecione um arquivo para importar.");
      return;
    }

    setIsImporting(true);

    const processData = async (data: any[]) => {
      try {
        const { data: responseData, error } = await supabase.functions.invoke('bulk-create-users', {
          body: data,
        });

        if (error) throw new Error(error.message);

        const { successCount, errorCount, errors } = responseData;

        if (errorCount > 0) {
          toast.warning(`${successCount} usuários importados com sucesso.`, {
            description: `${errorCount} linhas continham erros. ${errors.map((e: any) => e.error).join('; ')}`,
            duration: 8000,
          });
        } else {
          toast.success(`${successCount} usuários importados com sucesso!`);
        }

        queryClient.invalidateQueries({ queryKey: ['users'] });
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

  if (isLoading) {
    return <Card><CardContent className="p-6 text-center">Carregando...</CardContent></Card>;
  }

  return (
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
                    O arquivo deve conter as colunas: `name`, `email`, `password`, `role`.
                    O perfil (`role`) deve ser `gestor`, `cuidador` ou `responsavel`.
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
                    {isImporting ? "Importando..." : "Iniciar Importação"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button><UserPlus className="mr-2 h-4 w-4" />Novo Usuário</Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {!editingUser && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" {...register("email")} />
                      {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha *</Label>
                      <Input id="password" type="password" {...register("password")} />
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
                    <Select onValueChange={(value) => setValue("role", value as any)} defaultValue={editingUser?.role || 'responsavel'}>
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
                {selectedRole === 'responsavel' && (
                  <div className="space-y-2">
                    <Label>Estudantes Vinculados</Label>
                    <Select onValueChange={(value) => {
                      const currentIds = watch('student_ids') || [];
                      const newIds = currentIds.includes(value)
                        ? currentIds.filter(id => id !== value)
                        : [...currentIds, value];
                      setValue('student_ids', newIds);
                    }}>
                      <SelectTrigger><SelectValue placeholder="Selecione os estudantes..." /></SelectTrigger>
                      <SelectContent>
                        {students.map(student => <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Estudantes selecionados: {watch('student_ids')?.length || 0}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => handleDialogChange(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
                    {editingUser 
                      ? <>{updateUser.isPending ? 'Salvando...' : <><Save className="mr-2 h-4 w-4" /> Salvar</>}</>
                      : <>{createUser.isPending ? 'Criando...' : <><UserPlus className="mr-2 h-4 w-4" /> Criar</>}</>
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
              <TableHead>Perfil</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{user.phone || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(user)}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário e seus dados de nossos servidores.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteUser.mutate(user.user_id)} disabled={deleteUser.isPending}>Excluir</AlertDialogAction>
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