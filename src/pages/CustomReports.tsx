import { useStudents } from "@/hooks/useStudents";
import { useUsers } from "@/hooks/useUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileDown } from "lucide-react";
import { toast } from "sonner";

const CustomReports = () => {
  const { students, isLoading: isLoadingStudents } = useStudents();
  const { users, isLoading: isLoadingUsers } = useUsers();

  const isLoading = isLoadingStudents || isLoadingUsers;

  // Processamento de dados
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'ativo');
  const totalActiveStudents = activeStudents.length;
  const totalUsers = users.length;
  const totalCaregivers = users.filter(u => u.role === 'cuidador').length;
  const totalGuardians = users.filter(u => u.role === 'responsavel').length;
  const totalGestores = users.filter(u => u.role === 'gestor').length;

  // LÓGICA REVISADA E ROBUSTA:
  // 1. Normaliza papéis para minúsculas para evitar problemas de case sensitivity.
  // 2. Trata student_ids de forma mais flexível (array, string CSV, ou valor único).
  // 3. Verifica múltiplas variações de nomes de campos para vínculo direto no aluno.
  const caregiverRoles = ['cuidador', 'responsavel'];
  const assignedStudentIds = new Set(
    users
      .filter(u => u.role && caregiverRoles.includes(u.role.toLowerCase()))
      .flatMap(c => {
        const ids = c.student_ids;
        if (Array.isArray(ids)) return ids;
        if (typeof ids === 'string') return ids.split(',').map(i => i.trim());
        if (ids) return [ids];
        return [];
      })
      .map(id => String(id).trim())
  );
  
  const activeStudentsWithoutCaregiver = activeStudents.filter(s => {
    if (!s.id) return false;

    const studentData = s as any;
    // Verifica variações de nomes de campos que podem indicar um vínculo
    const hasDirectLink = 
      studentData.caregiver_id || 
      studentData.caregiverId ||
      studentData.caregiver || 
      studentData.cuidador_id ||
      studentData.cuidador ||
      studentData.guardian_id || 
      studentData.responsavel_id;
      
    const hasReverseLink = assignedStudentIds.has(String(s.id).trim());

    return !(hasDirectLink || hasReverseLink);
  });

  const studentsByClass = students.reduce((acc, student) => {
    const className = student.class_name ? student.class_name.trim() : "Sem Turma";
    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const studentsByClassData = Object.entries(studentsByClass).map(([name, total]) => ({ name, total }));

  // Gera dados de usuários dinamicamente baseado nos roles existentes
  const usersByRole = users.reduce((acc, user) => {
    const roleName = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Outros';
    acc[roleName] = (acc[roleName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const usersByRoleData = Object.entries(usersByRole).map(([role, count]) => ({ role, count }));

  const handleExport = (format: 'PDF' | 'CSV') => {
    toast.info(`A funcionalidade de exportar para ${format} ainda será implementada.`);
    console.log({
      geral: { totalAlunos: totalStudents, totalUsuarios: totalUsers },
      usuariosPorPerfil: usersByRoleData,
      alunosPorTurma: studentsByClassData,
      alunosSemCuidador: activeStudentsWithoutCaregiver.map(s => ({ id: s.id, nome: s.name })),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Relatório Geral do Sistema</CardTitle>
            <CardDescription>Um resumo completo dos dados da plataforma, pronto para exportação.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('PDF')}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('CSV')}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Seção de Resumo */}
        <section>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Resumo Geral</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{totalStudents}</p>
              <p className="text-sm text-muted-foreground">Total de Alunos</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{totalActiveStudents}</p>
              <p className="text-sm text-muted-foreground">Alunos Ativos</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-destructive">{activeStudentsWithoutCaregiver.length}</p>
              <p className="text-sm text-muted-foreground">Alunos Ativos sem Cuidador</p>
            </div>
          </div>
        </section>

        {/* Seção de Usuários */}
        <section>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Usuários por Categoria</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersByRoleData.map(item => (
                  <TableRow key={item.role}>
                    <TableCell className="font-medium">{item.role}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Seção de Alunos por Turma */}
        <section>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Alunos por Turma</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead className="text-right">Nº de Alunos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsByClassData.map(item => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
        
        {/* Seção de Alunos sem Cuidador */}
        <section>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Alunos Ativos que Precisam de Cuidador</h3>
          {activeStudentsWithoutCaregiver.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Aluno</TableHead>
                    <TableHead>Turma</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeStudentsWithoutCaregiver.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.class_name || 'Não informada'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Todos os alunos ativos possuem um cuidador vinculado.</p>
          )}
        </section>
      </CardContent>
    </Card>
  );
};

export default CustomReports;