import { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Edit, Save, Trash2, Stethoscope, FileText, BadgeInfo } from "lucide-react";
import { useStudents, Student } from "@/hooks/useStudents";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema de validação ATUALIZADO com todos os seus campos
const studentSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().trim().max(14, "CPF inválido").optional(),
  birth_date: z.string().nonempty("Data de nascimento é obrigatória"),
  class_name: z.string().trim().optional(),
  diagnosis: z.string().trim().optional(),
  special_needs: z.string().trim().optional(),
  medical_info: z.string().trim().optional(),
  status: z.enum(['ativo', 'inativo', 'transferido']),
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