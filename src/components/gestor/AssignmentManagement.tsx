import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsers, UserProfile } from "@/hooks/useUsers";
import { useStudents, Student } from "@/hooks/useStudents";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Loader2, Save, HeartHandshake } from "lucide-react";
import { AssignmentTabContent } from "./AssignmentTabContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function AssignmentManagement() {
  const queryClient = useQueryClient();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { students: allStudents, studentsWithoutCaregiver, studentsWithoutGuardian, isLoading: isLoadingStudents } = useStudents();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const caregivers = users.filter(u => u.role === 'cuidador');
  const guardians = users.filter(u => u.role === 'responsavel');

  const handleOpenModal = (user: UserProfile) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSaveChanges = async (studentIds: string[]) => {
    if (!selectedUser) return;
    setIsSaving(true);

    const userId = selectedUser.id;
    const isCaregiver = selectedUser.role === 'cuidador';
    const table = isCaregiver ? 'caregivers_students' : 'guardians_students';
    const userColumn = isCaregiver ? 'caregiver_id' : 'guardian_id';

    try {
      // 1. Remove vínculos existentes para este usuário
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq(userColumn, userId);

      if (deleteError) throw deleteError;

      // 2. Adiciona os novos vínculos selecionados
      if (studentIds.length > 0) {
        const inserts = studentIds.map(studentId => {
          const record: any = { [userColumn]: userId, student_id: studentId };
          if (!isCaregiver) record.relationship = 'Responsável';
          return record;
        });

        const { error: insertError } = await supabase.from(table).insert(inserts);
        if (insertError) throw insertError;
      }

      toast.success("Vínculos atualizados com sucesso!");
      
      // Atualiza as listas de usuários e estudantes para refletir as mudanças
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      
      setModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(`Erro ao salvar vínculos: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingUsers || isLoadingStudents;

  const getModalOptions = () => {
    if (!selectedUser) return [];

    const fullSelectedUser = users.find(u => u.id === selectedUser.id);
    if (!fullSelectedUser) return [];

    const isCaregiver = fullSelectedUser.role === 'cuidador';
    const unassignedStudents = isCaregiver ? studentsWithoutCaregiver : studentsWithoutGuardian;

    const currentlyAssignedToUser = allStudents.filter(student => {
      const assignments = isCaregiver
        ? fullSelectedUser.caregivers_students
        : fullSelectedUser.guardians_students;
      return (assignments || []).some((assignment: any) => assignment.students?.id === student.id);
    });

    const availableStudents = [...currentlyAssignedToUser, ...unassignedStudents];
    // Remove duplicados e transforma no formato para o MultiSelect
    return [...new Map(availableStudents.map(item => [item.id, item])).values()].map(s => ({ value: s.id, label: s.name }));
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <HeartHandshake className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold tracking-tight">Gestão de Vínculos</h2>
          </div>
          <p className="text-muted-foreground">Gerencie os vínculos entre cuidadores, estudantes, professores e turmas.</p>
        </div>
      </div>

      <Tabs defaultValue="caregivers-students">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="caregivers-students">Cuidadores e Alunos</TabsTrigger>
          <TabsTrigger value="guardians-students">Responsáveis e Alunos</TabsTrigger>
          <TabsTrigger value="teachers-classes" disabled>Professores e Turmas</TabsTrigger>
          <TabsTrigger value="students-classes" disabled>Alunos e Turmas</TabsTrigger>
        </TabsList>

        <TabsContent value="caregivers-students">
          <AssignmentTabContent
            users={caregivers}
            unassignedStudents={studentsWithoutCaregiver}
            userRole="cuidador"
            onEdit={handleOpenModal}
            isLoading={isLoading}
            allStudents={allStudents} // adiciona para referência
          />
        </TabsContent>

        <TabsContent value="guardians-students">
          <AssignmentTabContent
            users={guardians}
            unassignedStudents={studentsWithoutGuardian}
            userRole="responsavel"
            onEdit={handleOpenModal}
            isLoading={isLoading}
            allStudents={allStudents} // adiciona para referência
          />
        </TabsContent>
      </Tabs>

      {/* Modal para Editar Vínculos */}
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`Editar Vínculos de ${selectedUser?.name}`}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Selecione os estudantes que este {selectedUser?.role === 'cuidador' ? 'cuidador' : 'responsável'} irá acompanhar.
          </p>
          <MultiSelect
            options={getModalOptions()}
            selected={(() => {
              if (!selectedUser) return [];
              const fullUser = users.find(u => u.id === selectedUser.id);
              if (!fullUser) return [];
              if (fullUser.role === 'cuidador') {
                return (fullUser.caregivers_students || []).map((cs: any) => cs.students?.id).filter(Boolean);
              }
              return (fullUser.guardians_students || []).map((gs: any) => gs.students?.id).filter(Boolean);
            })()}
            onChange={handleSaveChanges}
            placeholder="Selecione os estudantes..."
            actionButton={
              <Button disabled={isSaving}>
                {isSaving
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                  : <><Save className="mr-2 h-4 w-4" />Salvar</>}
              </Button>
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
