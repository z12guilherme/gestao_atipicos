import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUsers } from "@/hooks/useUsers";
import { useStudents } from "@/hooks/useStudents";
import { toast } from "sonner";

interface Assignment {
  id: string;
  student_id: string;
  caregiver_id: string;
  assigned_at: string;
  student: {
    name: string;
    class_name?: string;
  };
  caregiver: {
    name: string;
    function_title?: string;
  };
}

export function AssignmentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  
  const queryClient = useQueryClient();
  const { users } = useUsers();
  const { students } = useStudents();

  const caregivers = users.filter(user => user.role === 'cuidador');

  // Buscar atribuições existentes
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('caregivers_students')
        .select(`
          id,
          student_id,
          caregiver_id,
          assigned_at,
          students:student_id(name, class_name),
          profiles:caregiver_id(name, function_title)
        `)
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        student_id: item.student_id,
        caregiver_id: item.caregiver_id,
        assigned_at: item.assigned_at,
        student: item.students as any,
        caregiver: item.profiles as any,
      })) as Assignment[];
    },
  });

  // Criar nova atribuição
  const createAssignment = useMutation({
    mutationFn: async ({ caregiverId, studentId }: { caregiverId: string; studentId: string }) => {
      const { data, error } = await supabase
        .from('caregivers_students')
        .insert({
          caregiver_id: caregiverId,
          student_id: studentId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Atribuição criada com sucesso!');
      setSelectedCaregiver("");
      setSelectedStudent("");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar atribuição: ${error.message}`);
    },
  });

  // Remover atribuição
  const removeAssignment = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('caregivers_students')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Atribuição removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover atribuição: ${error.message}`);
    },
  });

  const handleCreateAssignment = () => {
    if (!selectedCaregiver || !selectedStudent) {
      toast.error('Selecione um cuidador e um estudante');
      return;
    }

    // Verificar se a atribuição já existe
    const existingAssignment = assignments.find(
      a => a.caregiver_id === selectedCaregiver && a.student_id === selectedStudent
    );

    if (existingAssignment) {
      toast.error('Esta atribuição já existe');
      return;
    }

    createAssignment.mutate({
      caregiverId: selectedCaregiver,
      studentId: selectedStudent,
    });
  };

  // Estudantes não atribuídos
  const unassignedStudents = students.filter(student => 
    !assignments.some(assignment => assignment.student_id === student.id)
  );

  // Agrupar estudantes por cuidador
  const studentsByCaregiver = caregivers.map(caregiver => ({
    caregiver,
    students: assignments.filter(a => a.caregiver_id === caregiver.id)
  }));

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Atribuições de Estudantes</CardTitle>
              <CardDescription>
                Gerencie as atribuições de estudantes aos cuidadores
              </CardDescription>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nova Atribuição
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Atribuição</DialogTitle>
                  <DialogDescription>
                    Atribua um estudante a um cuidador
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cuidador</Label>
                    <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cuidador" />
                      </SelectTrigger>
                      <SelectContent>
                        {caregivers.map((caregiver) => (
                          <SelectItem key={caregiver.id} value={caregiver.id}>
                            {caregiver.name} {caregiver.function_title && `- ${caregiver.function_title}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Estudante</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um estudante" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} {student.class_name && `- ${student.class_name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateAssignment}
                      disabled={createAssignment.isPending}
                    >
                      {createAssignment.isPending ? 'Criando...' : 'Criar Atribuição'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo por cuidador */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {studentsByCaregiver.map(({ caregiver, students: assignedStudents }) => (
          <Card key={caregiver.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{caregiver.name}</CardTitle>
              <CardDescription>
                {caregiver.function_title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Estudantes Atribuídos</span>
                <Badge variant="secondary">
                  {assignedStudents.length}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {assignedStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum estudante atribuído
                  </p>
                ) : (
                  assignedStudents.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {assignment.student.name}
                        </p>
                        {assignment.student.class_name && (
                          <p className="text-xs text-muted-foreground">
                            {assignment.student.class_name}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAssignment.mutate(assignment.id)}
                        disabled={removeAssignment.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estudantes não atribuídos */}
      {unassignedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Estudantes Não Atribuídos
            </CardTitle>
            <CardDescription>
              {unassignedStudents.length} estudante(s) ainda não foram atribuídos a nenhum cuidador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {unassignedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    {student.class_name && (
                      <p className="text-sm text-muted-foreground">
                        {student.class_name}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">Não atribuído</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}