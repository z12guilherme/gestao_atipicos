import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useStudents } from "@/hooks/useStudents";
// CORREÇÃO: Importa a interface `User` com um alias `UserType` para evitar conflito com o ícone `User` de lucide-react.
import { useUsers } from "@/hooks/useUsers";
import { HeartHandshake, Link, Users, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function AssignmentsManagement() {
  const { students, isLoading: isLoadingStudents } = useStudents();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  
  const caregivers = users.filter(u => u.role === 'cuidador');
  const guardians = users.filter(u => u.role === 'responsavel');
  
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | undefined>();
  const [selectedGuardianId, setSelectedGuardianId] = useState<string | undefined>();

  // Query para buscar os vínculos específicos do estudante selecionado.
  // Isso é mais confiável do que depender da estrutura de dados do hook `useStudents`.
  const { data: studentLinks, isLoading: isLoadingLinks } = useQuery({
    queryKey: ['studentLinks', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return { caregiverId: undefined, guardianId: undefined };

      const { data, error } = await supabase.functions.invoke('get-student-links', {
        body: { student_id: selectedStudentId },
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Falha ao buscar vínculos.');

      return {
        caregiverId: data.data?.caregiverId,
        guardianId: data.data?.guardianId,
      };
    },
    enabled: !!selectedStudentId, // Só executa a query quando um estudante é selecionado.
  });

  // Efeito para atualizar os seletores quando os dados de vínculo são carregados.
  useEffect(() => {
    if (studentLinks) {
      setSelectedCaregiverId(studentLinks.caregiverId);
      setSelectedGuardianId(studentLinks.guardianId);
    } else if (!selectedStudentId) {
      // Limpa os seletores se nenhum estudante estiver selecionado
      setSelectedCaregiverId(undefined);
      setSelectedGuardianId(undefined);
    }
  }, [studentLinks, selectedStudentId]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleSave = async () => {
    if (!selectedStudentId) {
      toast.error("Nenhum estudante selecionado.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão inválida");

      const payload = {
        id: selectedStudentId,
        caregiver_ids: selectedCaregiverId ? [selectedCaregiverId] : [],
        guardian_ids: selectedGuardianId ? [selectedGuardianId] : [],
      };

      const { data, error: invokeError } = await supabase.functions.invoke('upsert-student', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: payload,
      });

      if (invokeError) throw invokeError;
      if (data && !data.success) throw new Error(data.error || 'Falha ao salvar vínculos na Edge Function.');

      toast.success("Vínculos atualizados com sucesso!");
      
      // Atualiza o cache local imediatamente com os dados confirmados pelo servidor
      // Isso garante que a interface mostre o vínculo correto mesmo se houver delay na replicação ou RLS
      queryClient.setQueryData(['studentLinks', selectedStudentId], {
        caregiverId: data.caregiver_ids?.[0],
        guardianId: data.guardian_ids?.[0],
      });
    } catch (error: any) {
      console.error("Erro ao salvar vínculos:", error);
      toast.error("Erro ao salvar vínculos.", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingStudents || isLoadingUsers || (!!selectedStudentId && isLoadingLinks);

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
                <SelectContent>{caregivers.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="font-medium">Responsável</label>
              <Select value={selectedGuardianId || ''} onValueChange={setSelectedGuardianId} disabled={!selectedStudentId || isLoading}>
                <SelectTrigger><SelectValue placeholder="Selecione um responsável" /></SelectTrigger>
                <SelectContent>{guardians.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={!selectedStudentId || isSaving} className="w-full">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? "Salvando..." : "Salvar Vínculos"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}