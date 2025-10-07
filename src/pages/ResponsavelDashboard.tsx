import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuardianData, Student, Report } from "@/hooks/useGuardianData"; // Importa Student e Report
import { useProfile } from "@/hooks/useProfile";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HeartHandshake, User, FileText, Calendar } from "lucide-react";
import { useStudentReports } from "@/hooks/useStudentReports"; // Importa o novo hook

/**
 * Componente para exibir os detalhes de um único estudante no painel do responsável.
 * Agora, ele busca seus próprios relatórios usando o hook `useStudentReports`.
 */
function StudentCard({ student }: { student: Student }) {
  // Busca os relatórios para este estudante específico.
  const { reports, isLoading: isLoadingReports } = useStudentReports(student.id);

  return (
    <Card className="overflow-hidden shadow-lg border-0 bg-white dark:bg-slate-800/50">
      <CardHeader className="bg-slate-50 dark:bg-slate-800 p-4 border-b dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
            {student.name.charAt(0)}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">{student.name}</CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
              {student.class_name || "Turma não definida"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center text-slate-600 dark:text-slate-300">
            <FileText className="h-4 w-4 mr-2" />
            Observações Recentes
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {isLoadingReports ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : reports && reports.length > 0 ? (
              reports.map(report => (
                <div key={report.id} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                  <p className="text-sm text-slate-700 dark:text-slate-200">{report.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {report.profiles?.name || 'Cuidador'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma observação registrada.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Painel principal para o perfil de Responsável (Pai/Mãe).
 * Exibe os estudantes vinculados e suas informações relevantes.
 */
export function ResponsavelDashboard() {
  const { profile } = useProfile();
  const { data: students, isLoading } = useGuardianData(); // O hook agora retorna um array de Student

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-8 w-3/4" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {getWelcomeMessage()}, {profile?.name?.split(' ')[0]}!
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Acompanhe o dia a dia e o desenvolvimento dos seus filhos.
        </p>
      </div>

      {!isLoading && (!students || students.length === 0) ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <HeartHandshake className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Nenhum filho cadastrado</h3>
          <p className="mt-2 text-md text-muted-foreground">Parece que não há estudantes vinculados ao seu perfil. Por favor, entre em contato com a gestão.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {students?.map(student => <StudentCard key={student.id} student={student} />)}
        </div>
      )}
    </div>
  );
}