import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserProfile } from "@/hooks/useUsers";
import { Student } from "@/hooks/useStudents";

interface AssignmentTabContentProps {
  users: UserProfile[];
  unassignedStudents: Student[];
  userRole: 'cuidador' | 'responsavel';
  onEdit: (user: UserProfile) => void;
  isLoading: boolean;
}

/**
 * Componente reutilizável para renderizar o conteúdo de uma aba de vínculos.
 * Exibe uma lista de usuários (cuidadores/responsáveis) e uma lista de estudantes não vinculados.
 */
export function AssignmentTabContent({
  users,
  unassignedStudents,
  userRole,
  onEdit,
  isLoading,
}: AssignmentTabContentProps) {
  const roleName = userRole === 'cuidador' ? 'cuidador' : 'responsável';
  const roleNamePlural = userRole === 'cuidador' ? 'cuidadores' : 'responsáveis';

  const getAssignedStudentsList = (user: UserProfile) => {
    const assignments = userRole === 'cuidador' ? user.caregivers_students : user.guardians_students;
    if (!assignments || assignments.length === 0) {
      return "Nenhum estudante vinculado";
    }
    // CORREÇÃO DEFINITIVA: Acessa o nome do estudante através do objeto aninhado 'students'.
    // O 'filter(Boolean)' remove quaisquer entradas nulas ou indefinidas antes do 'join'.
    const studentNames = assignments.map((item: any) => item.students?.name).filter(Boolean);
    if (studentNames.length === 0) return "Nenhum estudante vinculado";
    return studentNames.join(', ');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Coluna de Usuários */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Vínculos Atuais ({roleNamePlural.charAt(0).toUpperCase() + roleNamePlural.slice(1)})</CardTitle>
          <CardDescription>Visualize os estudantes atribuídos a cada {roleName}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p>Carregando {roleNamePlural}...</p>}
          {users.length > 0 ? users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getAssignedStudentsList(user)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => onEdit(user)}>Editar</Button>
            </div>
          )) : !isLoading && <p className="text-muted-foreground text-center py-4">Nenhum {roleName} encontrado.</p>}
        </CardContent>
      </Card>

      {/* Coluna de Alunos não vinculados */}
      <Card>
        <CardHeader>
          <CardTitle>Estudantes sem {roleName.charAt(0).toUpperCase() + roleName.slice(1)}</CardTitle>
          <CardDescription>Estudantes que aguardam a atribuição de um {roleName}.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Carregando...</p>}
          {unassignedStudents.length > 0 ? (
            <ul className="space-y-2">
              {unassignedStudents.map(student => (
                <li key={student.id} className="text-sm p-2 border rounded-md">{student.name}</li>
              ))}
            </ul>
          ) : !isLoading && <p className="text-muted-foreground text-center py-4">Todos os estudantes têm um {roleName}.</p>}
        </CardContent>
      </Card>
    </div>
  );
}