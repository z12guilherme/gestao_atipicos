import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsers, UserProfile } from "@/hooks/useUsers";
import { useStudents } from "@/hooks/useStudents";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Loader2, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AssignmentManagement() {
  const { users, isLoading: isLoadingUsers, updateUser } = useUsers();
  const { students, isLoading: isLoadingStudents } = useStudents();

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const caregivers = users.filter(u => u.role === 'cuidador');
  const guardians = users.filter(u => u.role === 'responsavel');

  // Lógica para estudantes não vinculados a cuidadores
  const assignedToCaregiverIds = new Set(caregivers.flatMap(c => c.caregivers_students.map((cs: any) => cs.student_id)));
  const unassignedToCaregiver = students.filter(s => !assignedToCaregiverIds.has(s.id));

  // Lógica para estudantes não vinculados a responsáveis
  const assignedToGuardianIds = new Set(guardians.flatMap(g => g.guardians_students.map((gs: any) => gs.student_id)));
  const unassignedToGuardian = students.filter(s => !assignedToGuardianIds.has(s.id));

  const handleOpenModal = (user: UserProfile) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSaveChanges = async (studentIds: string[]) => {
    if (!selectedUser) return;
    await updateUser.mutateAsync({
      id: selectedUser.id,
      profileData: { role: selectedUser.role }, // Role é necessário para a lógica do hook
      student_ids: studentIds,
    });
    setModalOpen(false);
    setSelectedUser(null);
  };

  const isLoading = isLoadingUsers || isLoadingStudents;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Vínculos</h2>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Coluna de Cuidadores */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Vínculos Atuais</CardTitle>
                <CardDescription>Visualize os estudantes atribuídos a cada cuidador.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading && <p>Carregando cuidadores...</p>}
                {caregivers.length > 0 ? caregivers.map(caregiver => (
                  <div key={caregiver.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{caregiver.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{caregiver.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {caregiver.caregivers_students.length > 0
                            ? caregiver.caregivers_students.map((cs: any) => cs.students.name).join(', ')
                            : "Nenhum estudante vinculado"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(caregiver)}>Editar</Button>
                  </div>
                )) : !isLoading && <p className="text-muted-foreground text-center py-4">Nenhum cuidador encontrado.</p>}
              </CardContent>
            </Card>

            {/* Coluna de Alunos não vinculados */}
            <Card>
              <CardHeader>
                <CardTitle>Estudantes não Vinculados</CardTitle>
                <CardDescription>Estudantes que aguardam a atribuição de um cuidador.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && <p>Carregando...</p>}
                {unassignedToCaregiver.length > 0 ? (
                  <ul className="space-y-2">
                    {unassignedToCaregiver.map(student => (
                      <li key={student.id} className="text-sm p-2 border rounded-md">{student.name}</li>
                    ))}
                  </ul>
                ) : !isLoading && <p className="text-muted-foreground text-center py-4">Todos os estudantes estão vinculados.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guardians-students">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Coluna de Responsáveis */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Vínculos Atuais (Responsáveis)</CardTitle>
                <CardDescription>Visualize os estudantes atribuídos a cada responsável.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading && <p>Carregando responsáveis...</p>}
                {guardians.length > 0 ? guardians.map(guardian => (
                  <div key={guardian.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Avatar><AvatarFallback>{guardian.name.charAt(0)}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-semibold">{guardian.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {guardian.guardians_students.length > 0
                            ? guardian.guardians_students.map((gs: any) => gs.students.name).join(', ')
                            : "Nenhum estudante vinculado"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(guardian)}>Editar</Button>
                  </div>
                )) : !isLoading && <p className="text-muted-foreground text-center py-4">Nenhum responsável encontrado.</p>}
              </CardContent>
            </Card>

            {/* Coluna de Alunos não vinculados a responsáveis */}
            <Card>
              <CardHeader>
                <CardTitle>Estudantes sem Responsável</CardTitle>
                <CardDescription>Estudantes que aguardam a atribuição de um responsável.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && <p>Carregando...</p>}
                {unassignedToGuardian.length > 0 ? (
                  <ul className="space-y-2">
                    {unassignedToGuardian.map(student => (
                      <li key={student.id} className="text-sm p-2 border rounded-md">{student.name}</li>
                    ))}
                  </ul>
                ) : !isLoading && <p className="text-muted-foreground text-center py-4">Todos os estudantes têm um responsável.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal para Editar Vínculos */}
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vínculos de {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">Selecione os estudantes que este {selectedUser?.role === 'cuidador' ? 'cuidador' : 'responsável'} irá acompanhar.</p>
          <MultiSelect
            options={students.map(s => ({ value: s.id, label: s.name }))}
            selected={selectedUser?.role === 'cuidador' ? selectedUser?.caregivers_students.map((cs: any) => cs.student_id) : selectedUser?.guardians_students.map((gs: any) => gs.student_id) || []}
            onChange={handleSaveChanges}
            placeholder="Selecione os estudantes..."
            actionButton={
              <Button disabled={updateUser.isPending}>
                {updateUser.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Salvar</>}
              </Button>
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}