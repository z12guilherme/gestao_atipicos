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
import { UserPlus, Edit, Calendar, FileText, GraduationCap, Heart, Activity, AlertCircle } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const studentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().optional(),
  birth_date: z.string().optional(),
  class_name: z.string().optional(),
  diagnosis: z.string().optional(),
  special_needs: z.string().optional(),
  medical_info: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'transferido']).default('ativo'),
});

type StudentFormData = z.infer<typeof studentSchema>;

export function StudentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { students, isLoading, createStudent } = useStudents();
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      status: 'ativo'
    }
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      await createStudent.mutateAsync(data as {
        name: string;
        cpf?: string;
        birth_date?: string;
        class_name?: string;
        diagnosis?: string;
        special_needs?: string;
        medical_info?: string;
        status: 'ativo' | 'inativo' | 'transferido';
      });
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao cadastrar estudante:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: 'default',
      inativo: 'secondary',
      transferido: 'outline'
    };
    
    const labels = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      transferido: 'Transferido'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
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
            <CardTitle>Gerenciar Estudantes</CardTitle>
            <CardDescription>
              Cadastre e gerencie informações dos estudantes
            </CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Estudante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-xl flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <span>Cadastrar Novo Estudante</span>
                </DialogTitle>
                <DialogDescription className="text-base">
                  Preencha as informações do estudante para criar seu perfil completo
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
                        placeholder="Digite o nome completo do estudante"
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
                      <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
                      <Input
                        id="cpf"
                        {...register("cpf")}
                        placeholder="000.000.000-00"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birth_date" className="text-sm font-medium">Data de Nascimento</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        {...register("birth_date")}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="class_name" className="text-sm font-medium">Turma/Classe</Label>
                      <Input
                        id="class_name"
                        {...register("class_name")}
                        placeholder="Ex: 1º Ano A, Pré-escola"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">Status do Estudante</Label>
                    <Select onValueChange={(value) => setValue("status", value as any)} defaultValue="ativo">
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>Ativo - Frequentando normalmente</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="inativo">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                            <span>Inativo - Temporariamente afastado</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="transferido">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                            <span>Transferido - Mudou de instituição</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Seção 2: Informações Médicas */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-red-700">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-sm font-bold">2</div>
                    <span>Informações de Saúde</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="diagnosis" className="text-sm font-medium flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span>Diagnóstico Médico</span>
                      </Label>
                      <Textarea
                        id="diagnosis"
                        {...register("diagnosis")}
                        placeholder="Descreva o diagnóstico médico, condições identificadas, etc."
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medical_info" className="text-sm font-medium flex items-center space-x-2">
                        <Heart className="h-4 w-4" />
                        <span>Informações Médicas Importantes</span>
                      </Label>
                      <Textarea
                        id="medical_info"
                        {...register("medical_info")}
                        placeholder="Medicações em uso, alergias, cuidados médicos especiais, contatos de emergência médica, etc."
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 3: Necessidades Especiais */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-purple-700">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-bold">3</div>
                    <span>Necessidades e Adaptações</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="special_needs" className="text-sm font-medium">Necessidades Especiais e Adaptações</Label>
                    <Textarea
                      id="special_needs"
                      {...register("special_needs")}
                      placeholder="Descreva as necessidades especiais, adaptações necessárias, estratégias de apoio, recursos assistivos, etc."
                      className="min-h-[120px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Inclua informações sobre adaptações físicas, pedagógicas, comportamentais ou tecnológicas necessárias
                    </p>
                  </div>
                </div>

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
                    disabled={createStudent.isPending}
                    className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {createStudent.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Cadastrando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Cadastrar Estudante</span>
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
              <TableHead>Turma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Informações</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.class_name || '-'}</TableCell>
                <TableCell>{getStatusBadge(student.status)}</TableCell>
                <TableCell>
                  {student.birth_date ? (
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date().getFullYear() - new Date(student.birth_date).getFullYear()} anos
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {(student.diagnosis || student.special_needs) && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="mr-1 h-3 w-3" />
                      Tem informações médicas
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