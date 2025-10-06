import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useStudents } from "@/hooks/useStudents";
// CORREÇÃO: Importa a interface `User` com um alias `UserType` para evitar conflito com o ícone `User` de lucide-react.
import { useUsers, User as UserType } from "@/hooks/useUsers";
import { User, HeartHandshake, Link, Users, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AssignmentsManagement() {
  const { students, isLoading: isLoadingStudents } = useStudents();
  const { users, isLoading: isLoadingUsers, updateUser } = useUsers();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const caregivers = users.filter(u => u.role === 'cuidador');
  const guardians = users.filter(u => u.role === 'responsavel');

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Encontra os vínculos atuais para o estudante selecionado
  const currentCaregiver = caregivers.find(c => c.student_ids?.includes(selectedStudentId!));
  const currentGuardian = guardians.find(g => g.student_ids?.includes(selectedStudentId!));  

  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | undefined>(currentCaregiver?.user_id);
  const [selectedGuardianId, setSelectedGuardianId] = useState<string | undefined>(currentGuardian?.user_id);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    // Encontra os vínculos atuais para o estudante recém-selecionado
    const caregiver = caregivers.find(c => c.student_ids?.includes(studentId));
    const guardian = guardians.find(g => g.student_ids?.includes(studentId));

    setSelectedCaregiverId(caregiver?.user_id);
    setSelectedGuardianId(guardian?.user_id);
  };

  const handleSave = () => {
    if (!selectedStudentId) {
      toast.error("Nenhum estudante selecionado.");
      return;
    }

    // Lógica para atualizar os vínculos
    // 1. Atualizar o cuidador
    if (currentCaregiver && currentCaregiver.user_id !== selectedCaregiverId) {
      // Desvincular do antigo
      const oldCaregiverStudents = currentCaregiver.student_ids?.filter(id => id !== selectedStudentId) || [];
      updateUser.mutate({ id: currentCaregiver.id, profileData: {}, student_ids: oldCaregiverStudents });
    }
    if (selectedCaregiverId && selectedCaregiverId !== currentCaregiver?.user_id) {
      // Vincular ao novo
      const newCaregiver = caregivers.find(c => c.user_id === selectedCaregiverId);
      if (newCaregiver) {
        const newCaregiverStudents = [...(newCaregiver.student_ids || []), selectedStudentId];
        updateUser.mutate({ id: newCaregiver.id, profileData: {}, student_ids: newCaregiverStudents });
      }
    }

    // 2. Atualizar o responsável
    if (currentGuardian && currentGuardian.user_id !== selectedGuardianId) {
      // Desvincular do antigo
      const oldGuardianStudents = currentGuardian.student_ids?.filter(id => id !== selectedStudentId) || [];
      updateUser.mutate({ id: currentGuardian.id, profileData: {}, student_ids: oldGuardianStudents });
    }
    if (selectedGuardianId && selectedGuardianId !== currentGuardian?.user_id) {
      // Vincular ao novo
      const newGuardian = guardians.find(g => g.user_id === selectedGuardianId);
      if (newGuardian) {
        const newGuardianStudents = [...(newGuardian.student_ids || []), selectedStudentId];
        updateUser.mutate({ id: newGuardian.id, profileData: {}, student_ids: newGuardianStudents });
      }
    }
    toast.success("Vínculos atualizados com sucesso!");
  };

  const isLoading = isLoadingStudents || isLoadingUsers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center"><Link className="mr-3 h-6 w-6" />Gerenciamento de Vínculos</h1>
          <p className="text-muted-foreground">Selecione um estudante para atribuir cuidadores e responsáveis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna de Seleção de Estudante */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" />Estudantes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <p>Carregando estudantes...</p> : (
              <Select onValueChange={handleStudentSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estudante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Coluna de Gerenciamento de Vínculos */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center"><HeartHandshake className="mr-2 h-5 w-5" />Vínculos de {selectedStudent?.name || "..."}</CardTitle>
            <CardDescription>Atribua um cuidador e um responsável para o estudante selecionado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="font-medium">Cuidador(a)</label>
              {/* MELHORIA: Desabilita o seletor se nenhum estudante for selecionado */}
              <Select value={selectedCaregiverId || ''} onValueChange={setSelectedCaregiverId} disabled={!selectedStudentId || isLoading}>
                <SelectTrigger><SelectValue placeholder="Selecione um cuidador" /></SelectTrigger>
                <SelectContent>{caregivers.map(user => <SelectItem key={user.user_id} value={user.user_id}>{user.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="font-medium">Responsável</label>
              <Select value={selectedGuardianId || ''} onValueChange={setSelectedGuardianId} disabled={!selectedStudentId || isLoading}>
                <SelectTrigger><SelectValue placeholder="Selecione um responsável" /></SelectTrigger>
                <SelectContent>{guardians.map(user => <SelectItem key={user.user_id} value={user.user_id}>{user.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={!selectedStudentId || updateUser.isPending} className="w-full">
              {updateUser.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {updateUser.isPending ? "Salvando..." : "Salvar Vínculos"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}