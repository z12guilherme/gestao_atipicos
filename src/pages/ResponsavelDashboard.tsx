import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGuardianData, Student } from "@/hooks/useGuardianData";
import { useProfile } from "@/hooks/useProfile";
import { format, formatDistanceToNow, differenceInYears } from 'date-fns';
import { subDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HeartHandshake, User, FileText, Calendar, GraduationCap, Stethoscope, Info, Loader2, ShieldCheck, Cake, BarChart3, TrendingUp, BookOpen, Clock } from "lucide-react";
import { useStudentReports } from "@/hooks/useStudentReports";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { cn } from "@/lib/utils";
import { useSchedules } from "@/hooks/useSchedules";


/**
 * Processa os relatórios para criar dados para o gráfico de atividades.
 * Agrupa as observações por semana dos últimos 3 meses.
 */
const processReportDataForChart = (reports: { created_at: string }[]) => {
  if (!reports) return [];
  const threeMonthsAgo = subDays(new Date(), 90);
  const weeklyCounts: { [key: string]: number } = {};

  reports.forEach(report => {
    const reportDate = new Date(report.created_at);
    if (reportDate >= threeMonthsAgo) {
      const weekStart = startOfWeek(reportDate, { locale: ptBR });
      const weekKey = format(weekStart, 'dd/MM');
      weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
    }
  });

  const chartData = Object.keys(weeklyCounts)
    .map(weekKey => ({
      name: `Semana ${weekKey}`,
      observacoes: weeklyCounts[weekKey],
      // Adiciona uma data real para ordenação
      date: startOfWeek(new Date(weekKey.split('/').reverse().join('-')), { locale: ptBR }),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ name, observacoes }) => ({ name, observacoes })); // Remove a data após ordenar

  return chartData;
};

/**
 * Componente que exibe os detalhes completos de um estudante selecionado.
 */
function StudentDetails({ student }: { student: Student }) {
  const { reports, isLoading: isLoadingReports } = useStudentReports(student.id);
  const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : null;
  const reportChartData = processReportDataForChart(reports || []);

  const today = useMemo(() => new Date(), []);
  const { schedules: studentSchedule, loading: isLoadingSchedule } = useSchedules(student.id, today);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho do Estudante */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:p-6">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl shadow-md">
              {student.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-50">{student.name}</CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400 flex items-center mt-1">
                <GraduationCap className="inline-block h-4 w-4 mr-1.5" />
                {student.class_name || "Turma não informada"}
              </CardDescription>
            </div>
          </div>
          {student.status && (
            <Badge variant={student.status === 'ativo' ? 'default' : 'destructive'} className="capitalize text-xs">
              {student.status}
            </Badge>
          )}
        </CardHeader>
      </Card>
      <div className="grid lg:grid-cols-3 gap-6">
      {/* Coluna Principal */}
      <div className="lg:col-span-2 space-y-6">
        {/* Card de Informações Pessoais */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><User className="mr-2 h-5 w-5 text-blue-500" /> Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm">
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
          </CardContent>
        </Card>

        {/* Card de Análise e Gráficos */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><TrendingUp className="mr-2 h-5 w-5 text-indigo-500" /> Análise de Atividades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{reports?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Observações Totais</p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {reports && reports.length > 0 ? formatDistanceToNow(new Date(reports[0].created_at), { locale: ptBR }) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Último Registro</p>
              </div>
            </div>

            {/* Gráfico de Atividades */}
            {isLoadingReports ? <Skeleton className="h-48 w-full mt-4" /> : reportChartData.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-2 mt-4">Observações por Semana (Últimos 3 meses)</h5>
                <div className="h-48 w-full">
                  <ResponsiveContainer>
                    <BarChart data={reportChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} width={30} tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                        }}
                      />
                      <Bar dataKey="observacoes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coluna de Observações (Sidebar) */}
      <div className="lg:col-span-1 space-y-6">
        {/* Card de Cronograma */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><Clock className="mr-2 h-5 w-5 text-green-500" /> Cronograma do Dia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoadingSchedule ? (
              <div className="flex items-center justify-center p-4 text-slate-500 dark:text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando...
              </div>
            ) : studentSchedule.length > 0 ? studentSchedule.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="text-sm font-bold text-green-600 dark:text-green-400">{item.start_time}</div>
                <div className="h-full w-px bg-slate-200 dark:bg-slate-700"></div>
                <div>
                  <p className="font-medium text-sm text-slate-700 dark:text-slate-200">{item.activity}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 px-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma atividade específica agendada para hoje.</p>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Card de Observações */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><FileText className="mr-2 h-5 w-5 text-blue-500" /> Últimas Observações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
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
                  <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Nenhuma observação registrada.</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}

/**
 * Painel principal para o perfil de Responsável.
 * Exibe os estudantes vinculados e suas informações, com um design moderno e acolhedor.
 */
export function ResponsavelDashboard() {
  const { profile, isLoading: isLoadingProfile } = useProfile();
  const { data: students, isLoading } = useGuardianData();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Define o estudante selecionado
  const selectedStudent = useMemo(() => {
    if (!students) return null;
    const currentId = selectedStudentId || students?.[0]?.id;
    return students?.find(s => s.id === currentId);
  }, [students, selectedStudentId]);

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
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
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
      ) : students && (
        <div className="space-y-6">
          {/* Seletor de Estudantes (Abas) */}
          <div className="border-b border-slate-200 dark:border-slate-800">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {students.map((student) => (
                <Button
                  key={student.id}
                  variant="ghost"
                  onClick={() => setSelectedStudentId(student.id)}
                  className={cn(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-none",
                    (selectedStudentId || students[0].id) === student.id
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700'
                  )}
                >
                  {student.name}
                </Button>
              ))}
            </nav>
          </div>

          {/* Detalhes do Estudante Selecionado */}
          {selectedStudent ? (
            <StudentDetails student={selectedStudent} />
          ) : <p>Selecione um estudante para ver os detalhes.</p>}
        </div>
      )}
    </div>
  );
}