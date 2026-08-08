import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Student } from "@/hooks/useGuardianData";
import { useProfile } from "@/hooks/useProfile";
import { format, formatDistanceToNow, differenceInYears } from 'date-fns';
import { subDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HeartHandshake, User, FileText, Calendar, GraduationCap, Stethoscope, Info, Loader2, ShieldCheck, Cake, BarChart3, TrendingUp, BookOpen, Clock, Eye } from "lucide-react";
import { useStudentReports } from "@/hooks/useStudentReports";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { cn } from "@/lib/utils";
import { useSchedules } from "@/hooks/useSchedules";
import { PdfViewerDialog } from "@/components/shared/PdfViewerDialog";


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
  const [isPdfViewerOpen, setPdfViewerOpen] = useState(false);
  const { reports, isLoading: isLoadingReports } = useStudentReports(student.id);
  const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : null;
  const reportChartData = processReportDataForChart(reports || []);

  const today = useMemo(() => new Date(), []);
  const { schedules: studentSchedule, isLoading: isLoadingSchedule } = useSchedules(student.id, today);

  return (
    <>
      <PdfViewerDialog
        isOpen={isPdfViewerOpen}
        onOpenChange={setPdfViewerOpen}
        filePath={student.laudo_url}
        fileName={`Laudo de ${student.name}`}
      />
      <div className="space-y-6 animate-fade-in">
        {/* Student header card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 p-5 md:p-6">
          <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="absolute bottom-0 left-1/2 h-16 w-16 rounded-full bg-white/8 blur-lg" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {student.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{student.name}</h2>
                <p className="text-sm text-white/70 flex items-center gap-1.5 mt-0.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {student.class_name || 'Turma não informada'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {student.status && (
                <Badge
                  variant={student.status === 'ativo' ? 'success' : 'destructive'}
                  className="capitalize text-xs bg-white/20 text-white border-white/30"
                >
                  {student.status}
                </Badge>
              )}
              {student.laudo_url && (
                <Button
                  size="sm"
                  onClick={() => setPdfViewerOpen(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-lg"
                  variant="ghost"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Ver Laudo
                </Button>
              )}
            </div>
          </div>
        </div>
      <div className="grid lg:grid-cols-3 gap-6">
      {/* Coluna Principal */}
      <div className="lg:col-span-2 space-y-6">
        {/* Card de Informações Pessoais */}
        <Card className="rounded-2xl border-border/60 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Dados Pessoais
            </CardTitle>
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
        <Card className="rounded-2xl border-border/60 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/15">
                <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              Acompanhamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{reports?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Observações Totais</p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate">
                  {reports && reports.length > 0 ? formatDistanceToNow(new Date(reports[0].created_at), { locale: ptBR }) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Último Registro</p>
              </div>
            </div>

            {/* Gráfico de Atividades */}
            {isLoadingReports ? <Skeleton className="h-48 w-full mt-4" /> : (
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-2 mt-4">Observações por Semana (Últimos 3 meses)</h5>
                {reportChartData.length > 0 ? (
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
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">Não há dados suficientes para gerar o gráfico.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coluna de Observações (Sidebar) */}
      <div className="lg:col-span-1 space-y-6">
        {/* Card de Cronograma */}
        <Card className="rounded-2xl border-border/60 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
                <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Cronograma do Dia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
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
        <Card className="rounded-2xl border-border/60 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Últimas Observações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {isLoadingReports && (
                <div className="flex items-center justify-center p-4 text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando...
                </div>
              )}
              {!isLoadingReports && reports && reports.length > 0 && (
                reports.map(report => (
                  <div key={report.id} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-800 dark:text-slate-200 mb-2 whitespace-pre-wrap">{report.content}</p>
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
    </>
  );
}

/**
 * Painel principal para o perfil de Responsável.
 * Exibe os estudantes vinculados e suas informações, com um design moderno e acolhedor.
 */
export function ResponsavelDashboard() {
  const { profile, isLoading: isLoadingProfile } = useProfile();
  
  // Busca direta dos estudantes vinculados
  const { data: students, isLoading } = useQuery({
    queryKey: ['guardianStudents', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('guardians_students')
        .select('students(*)')
        .eq('guardian_id', profile.id);
        
      if (error) throw error;
      
      // Filtra estudantes nulos que podem vir de vínculos quebrados
      const validStudents = data.map((item: any) => item.students).filter(Boolean);

      // Ordena os estudantes por nome
      return validStudents.sort((a, b) => a.name.localeCompare(b.name)) as Student[];
    },
    enabled: !!profile?.id,
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Define o estudante selecionado
  const selectedStudent = useMemo(() => {
    if (!students) return null;
    const currentId = selectedStudentId || students?.[0]?.id;
    return students.find(s => s.id === currentId);
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
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 p-6 md:p-8 animate-fade-in-down">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-0 right-1/4 h-20 w-20 rounded-full bg-white/8 blur-lg" />
        <div className="relative">
          <p className="text-xs font-semibold text-blue-100/80 uppercase tracking-widest mb-2">Portal do Responsável</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {getWelcomeMessage()}, {profile?.name?.split(' ')[0]}!
          </h1>
          <p className="text-blue-100/80 text-sm mt-1.5">
            Acompanhe o dia a dia e o desenvolvimento dos seus filhos.
          </p>
        </div>
      </div>

      {!isLoading && (!students || students.length === 0) ? (
        <div className="text-center py-20 px-6 border-2 border-dashed border-border/60 rounded-2xl bg-muted/30">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30">
            <HeartHandshake className="h-8 w-8 text-indigo-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Nenhum Estudante Vinculado</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">Entre em contato com a gestão da instituição para vincular um estudante ao seu perfil.</p>
        </div>
      ) : students && (
        <div className="space-y-6">
          {/* Student pill tabs */}
          {students.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    selectedStudent?.id === student.id
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  )}
                >
                  {student.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {/* Detalhes do Estudante Selecionado */}
          {selectedStudent ? (
            <StudentDetails student={selectedStudent} />
          ) : <p className="text-center text-muted-foreground py-10">Selecione um estudante para ver os detalhes.</p>}
        </div>
      )}
    </div>
  );
}