import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Edit, Phone, Mail, AlertCircle, Users as UsersIcon, Heart } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useStudents } from "@/hooks/useStudents";
import { useGuardiansStudents } from "@/hooks/useGuardiansStudents";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";

const userSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa"),
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  cpf: z.string().trim().max(14, "CPF inválido").optional(),
  phone: z.string().trim().max(20, "Telefone inválido").optional(),
  role: z.enum(['gestor', 'cuidador', 'responsavel']),
  function_title: z.string().trim().max(100, "Função muito longa").optional(),
  work_schedule: z.string().trim().max(500, "Horário muito longo").optional(),
  student_ids: z.array(z.string()).optional(),
  relationship: z.string().trim().max(50, "Relacionamento muito longo").optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { users, isLoading, createUser } = useUsers();
  const { students } = useStudents();
  const { assignStudentsToGuardian } = useGuardiansStudents();
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: UserFormData) => {
    try {
      const newUser = await createUser.mutateAsync({
        email: data.email,
        password: data.password,
        name: data.name,
        cpf: data.cpf,
        phone: data.phone,
        role: data.role,
        function_title: data.function_title,
        work_schedule: data.work_schedule,
      });

      // Se for responsável e tiver alunos selecionados, fazer a associação
      if (data.role === 'responsavel' && selectedStudents.length > 0 && data.relationship) {
        await assignStudentsToGuardian.mutateAsync({
          guardianId: newUser.id,
          studentIds: selectedStudents,
          relationship: data.relationship,
        });
      }

      reset();
      setSelectedStudents([]);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      gestor: 'destructive',
      cuidador: 'default',
      responsavel: 'secondary'
    };
    
    const labels = {
      gestor: 'Gestor',
      cuidador: 'Cuidador',
      responsavel: 'Responsável'
    };

    return (
      <Badge variant={variants[role as keyof typeof variants] as any}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciar Usuários</CardTitle>
            <CardDescription>
              Cadastre e gerencie funcionários, cuidadores e responsáveis
            </CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-xl flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-white" />
                  </div>
                  <span>Cadastrar Novo Usuário</span>
                </DialogTitle>
                <DialogDescription className="text-base">
                  Preencha os dados para criar um novo perfil de usuário no sistema
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Seção 1: Informações Básicas */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-blue-700">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold">1</div>
                    <span>Informações Pessoais</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Nome Completo *</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Digite o nome completo"
                        className="h-11"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.name.message}</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium">Tipo de Perfil *</Label>
                      <Select onValueChange={(value) => setValue("role", value as any)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione o tipo de usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gestor">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                              <span>Gestor - Administrador do sistema</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="cuidador">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span>Cuidador - Profissional especializado</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="responsavel">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                              <span>Responsável - Familiar ou tutor</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-sm text-destructive flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.role.message}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
                      <Input
                        id="cpf"
                        {...register("cpf")}
                        placeholder="000.000.000-00"
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="(11) 99999-9999"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 2: Acesso ao Sistema */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-blue-700">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold">2</div>
                    <span>Dados de Acesso</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="usuario@exemplo.com"
                        className="h-11"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.email.message}</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Senha Temporária *</Label>
                      <Input
                        id="password"
                        type="password"
                        {...register("password")}
                        placeholder="Mínimo 6 caracteres"
                        className="h-11"
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.password.message}</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        O usuário poderá alterar a senha no primeiro acesso
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seção 3: Informações Específicas do Perfil */}
                {selectedRole === 'cuidador' && (
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center space-x-2 text-lg font-semibold text-green-700">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold">3</div>
                      <span>Informações Profissionais</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="function_title" className="text-sm font-medium">Função/Cargo</Label>
                        <Input
                          id="function_title"
                          {...register("function_title")}
                          placeholder="Ex: Cuidador Especializado, Terapeuta"
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="work_schedule" className="text-sm font-medium">Horário de Trabalho</Label>
                        <Textarea
                          id="work_schedule"
                          {...register("work_schedule")}
                          placeholder="Ex: Segunda a Sexta, 8h às 17h"
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === 'responsavel' && (
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center space-x-2 text-lg font-semibold text-orange-700">
                      <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-sm font-bold">3</div>
                      <span>Vínculo Familiar</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="relationship" className="text-sm font-medium">Grau de Parentesco *</Label>
                        <Select onValueChange={(value) => setValue("relationship", value)}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione o grau de parentesco" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pai">Pai</SelectItem>
                            <SelectItem value="mae">Mãe</SelectItem>
                            <SelectItem value="avo_paterno">Avô Paterno</SelectItem>
                            <SelectItem value="avo_materna">Avó Materna</SelectItem>
                            <SelectItem value="tio">Tio(a)</SelectItem>
                            <SelectItem value="irmao">Irmão(ã)</SelectItem>
                            <SelectItem value="tutor_legal">Tutor Legal</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.relationship && (
                          <p className="text-sm text-destructive flex items-center space-x-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>{errors.relationship.message}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center space-x-2">
                          <UsersIcon className="h-4 w-4" />
                          <span>Estudantes Relacionados</span>
                        </Label>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                          {students.length === 0 ? (
                            <div className="text-center py-6">
                              <Heart className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                              <p className="text-sm text-muted-foreground">Nenhum estudante cadastrado ainda</p>
                              <p className="text-xs text-muted-foreground mt-1">Cadastre estudantes primeiro para relacioná-los</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {students.map((student) => (
                                <div key={student.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                                  <Checkbox
                                    id={`student-${student.id}`}
                                    checked={selectedStudents.includes(student.id)}
                                    onCheckedChange={() => toggleStudent(student.id)}
                                  />
                                  <div className="flex-1">
                                    <label
                                      htmlFor={`student-${student.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {student.name}
                                    </label>
                                    {student.class_name && (
                                      <p className="text-xs text-muted-foreground mt-1">{student.class_name}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedStudents.length > 0 && (
                          <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
                            {selectedStudents.length} estudante(s) selecionado(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createUser.isPending}
                    className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {createUser.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Criando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <UserPlus className="h-4 w-4" />
                        <span>Criar Usuário</span>
                      </div>
                    )}
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
              <TableHead>Perfil</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {user.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-1 h-3 w-3" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {user.function_title && (
                    <div className="text-sm">{user.function_title}</div>
                  )}
                  {user.work_schedule && (
                    <div className="text-xs text-muted-foreground">
                      {user.work_schedule}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}