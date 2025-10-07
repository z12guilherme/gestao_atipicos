import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useGuardianData, Student } from "@/hooks/useGuardianData";
import { useProfile } from "@/hooks/useProfile";
import { format, formatDistanceToNow, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HeartHandshake, User, FileText, Calendar, GraduationCap, Stethoscope, Info, Loader2, ShieldCheck, Cake } from "lucide-react";
import { useStudentReports } from "@/hooks/useStudentReports";

/**
 * Componente para exibir os detalhes de um único estudante no painel do responsável.
 * Busca seus próprios relatórios usando o hook `useStudentReports` para maior modularidade.
 */
function StudentCard({ student }: { student: Student }) {
  const { reports, isLoading: isLoadingReports } = useStudentReports(student.id);
  const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : null;

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg border-0 bg-white dark:bg-slate-900/70 transition-all hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b dark:border-slate-800 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl shadow-md">
            {student.name.charAt(0)}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-50">{student.name}</CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
              <GraduationCap className="inline-block h-4 w-4 mr-1.5" />
              {student.class_name || "Turma não informada"}
            </CardDescription>
          </div>
        </div>
        {student.status && (
          <Badge variant={student.status === 'Ativo' ? 'default' : 'destructive'} className="capitalize">
            {student.status}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-6 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5 text-sm">
          {student.birth_date && (
            <div className="flex items-start space-x-3">
              <Cake className="h-4 w-4 mt-0.5 text-pink-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-600 dark:text-slate-200">Nascimento</p>
                <p className="text-slate-500 dark:text-slate-400">
                  {format(new Date(student.birth_date), 'dd/MM/yyyy')} ({age} anos)
                </p>
              </div>
            </div>
          )}
          {student.diagnosis && (
            <div className="flex items-start space-x-3">
              <Stethoscope className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-600 dark:text-slate-200">Diagnóstico</p>
                <p className="text-slate-500 dark:text-slate-400">{student.diagnosis}</p>
              </div>
            </div>
          )}
          {student.special_needs && (
            <div className="flex items-start space-x-3">
              <Info className="h-4 w-4 mt-0.5 text-teal-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-600 dark:text-slate-200">Necessidades</p>
                <p className="text-slate-500 dark:text-slate-400">{student.special_needs}</p>
              </div>
            </div>
          )}
          {student.medical_info && (
            <div className="flex items-start space-x-3">
              <ShieldCheck className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-600 dark:text-slate-200">Informações Médicas</p>
                <p className="text-slate-500 dark:text-slate-400">{student.medical_info}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold flex items-center text-slate-700 dark:text-slate-100">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Últimas Observações
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {isLoadingReports && (
              <div className="flex items-center justify-center p-4 text-slate-500 dark:text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando...
              </div>
            )}
            {!isLoadingReports && reports && reports.length > 0 && (
              reports.map(report => (
                <div key={report.id} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-800 dark:text-slate-200 mb-2">{report.content}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center"><User className="h-3 w-3 mr-1.5" />{report.caregiver_name || 'Cuidador'}</span>
                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1.5" />{formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: ptBR })}</span>
                  </div>
                </div>
              ))
            )}
            {!isLoadingReports && (!reports || reports.length === 0) && (
              <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma observação foi registrada recentemente.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Painel principal para o perfil de Responsável.
 * Exibe os estudantes vinculados e suas informações, com um design moderno e acolhedor.
 */
export function ResponsavelDashboard() {
  const { profile, isLoading: isLoadingProfile } = useProfile();
  const { data: students, isLoading } = useGuardianData();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Skeleton loading state
  if (isLoading || isLoadingProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="animate-fade-in-down">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          {getWelcomeMessage()}, {profile?.name?.split(' ')[0]}!
        </h1>
        <p className="text-md md:text-lg text-muted-foreground mt-2">
          Acompanhe o dia a dia e o desenvolvimento dos seus filhos.
        </p>
      </div>

      {!isLoading && (!students || students.length === 0) ? (
        <div className="text-center py-20 px-6 border-2 border-dashed rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
          <HeartHandshake className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" />
          <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">Nenhum Estudante Vinculado</h3>
          <p className="mt-2 text-md text-muted-foreground max-w-md mx-auto">Parece que ainda não há estudantes associados ao seu perfil. Por favor, entre em contato com a gestão da instituição para fazer o vínculo.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {students?.map(student => <StudentCard key={student.id} student={student} />)}
        </div>
      )}
    </div>
  );
}