import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PdfViewerDialog } from "@/components/shared/PdfViewerDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  GraduationCap,
  Heart,
  Calendar,
  Activity,
  MessageSquare,
  FileText,
  Star,
  Eye,
  Sparkles,
  Clock,
} from "lucide-react";
import { useCaregiverData, Student } from "@/hooks/useCaregiverData";
import { useCaregiverDashboardData } from "@/hooks/useCaregiverDashboardData";
import { useProfile } from "@/hooks/useProfile";
import { ScheduleManagement } from "@/pages/ScheduleManagement";
import { NewNoteDialog } from "@/pages/NewNoteDialog";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function StudentCard({ student }: { student: Student }) {
  const [isPdfViewerOpen, setPdfViewerOpen] = useState(false);

  return (
    <>
      <PdfViewerDialog
        isOpen={isPdfViewerOpen}
        onOpenChange={setPdfViewerOpen}
        filePath={student.laudo_url}
        fileName={`Laudo de ${student.name}`}
      />
      <div className="group flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300 animate-fade-in">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all">
          {student.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{student.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <GraduationCap className="h-3 w-3" />
            {student.class_name || 'Sem turma'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {student.laudo_url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600"
              onClick={() => setPdfViewerOpen(true)}
              title="Visualizar Laudo"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
          <Badge
            variant={student.status === 'ativo' ? 'success' : 'secondary'}
            className="capitalize text-xs rounded-full"
          >
            {student.status}
          </Badge>
        </div>
      </div>
    </>
  );
}

const StatCard = ({
  title, value, subtitle, icon: Icon, gradient, delay,
}: {
  title: string; value: string | number; subtitle: string;
  icon: React.ElementType; gradient: string; delay: string;
}) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} animate-slide-up delay-${delay} group hover:scale-[1.02] transition-transform duration-300`}>
    <div className="absolute -top-3 -right-3 h-16 w-16 rounded-full bg-white/10 blur-sm" />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-white/75 uppercase tracking-wide">{title}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        <p className="mt-1 text-xs text-white/60">{subtitle}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
  </div>
);

export function CuidadorDashboard() {
  const { profile } = useProfile();
  const [isNoteDialogOpen, setNoteDialogOpen] = useState(false);

  const { students, isLoading: isLoadingStudents } = useCaregiverData();
  const { data: dashboardData, isLoading: isLoadingDashboard } = useCaregiverDashboardData();

  const assignedStudents = useMemo(() =>
    [...students].sort((a, b) => a.name.localeCompare(b.name)),
    [students]
  );

  const isLoading = isLoadingStudents || isLoadingDashboard;
  const recentNotes = dashboardData?.recentNotes || [];
  const todayScheduleCount = dashboardData?.todayScheduleCount || 0;

  const getWelcomeMessage = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const stats = [
    {
      title: "Estudantes",
      value: assignedStudents.length,
      subtitle: "Sob seus cuidados",
      icon: Users,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      delay: "100",
    },
    {
      title: "Atividades Hoje",
      value: todayScheduleCount > 0 ? todayScheduleCount : "–",
      subtitle: "Programadas para hoje",
      icon: Calendar,
      gradient: "bg-gradient-to-br from-indigo-500 to-violet-600",
      delay: "200",
    },
    {
      title: "Observações",
      value: recentNotes.length > 0 ? recentNotes.length : "–",
      subtitle: "Registradas hoje",
      icon: FileText,
      gradient: "bg-gradient-to-br from-violet-500 to-purple-700",
      delay: "300",
    },
    {
      title: "Avaliação",
      value: "N/A",
      subtitle: "Média das famílias",
      icon: Star,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      delay: "400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 md:p-8 animate-fade-in-down">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-0 left-1/3 h-20 w-20 rounded-full bg-white/8 blur-lg" />
        <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-teal-800/30" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-emerald-200 animate-pulse" />
              <span className="text-xs font-medium text-emerald-200 uppercase tracking-wide">Painel do Cuidador</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {getWelcomeMessage()}, {profile?.name?.split(' ')[0]}!
            </h1>
            <p className="text-emerald-100/80 text-sm mt-1.5">
              Acompanhe suas atividades e o progresso dos estudantes.
            </p>
            <p className="text-xs text-emerald-200/60 mt-2 flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Button
            onClick={() => setNoteDialogOpen(true)}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm rounded-xl w-fit"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Nova Observação
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))
          : stats.map((s) => <StatCard key={s.title} {...s} />)
        }
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Schedule — takes 2 cols */}
        <div className="lg:col-span-2 animate-slide-up delay-200">
          <ScheduleManagement />
        </div>

        {/* Sidebar */}
        <div className="space-y-4 animate-slide-up delay-300">
          {/* Students */}
          <Card className="rounded-2xl border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
                  <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Seus Estudantes
                <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {assignedStudents.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ) : assignedStudents.length === 0 ? (
                <div className="text-center py-6 px-2">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-muted">
                    <Heart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm font-medium">Sem estudantes</p>
                  <p className="text-xs text-muted-foreground mt-1">Peça a um gestor para atribuir estudantes.</p>
                </div>
              ) : (
                assignedStudents.map((s) => <StudentCard key={s.id} student={s} />)
              )}
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card className="rounded-2xl border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/15">
                  <MessageSquare className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                Observações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <Skeleton className="h-20 w-full rounded-xl" />
              ) : recentNotes.length === 0 ? (
                <div className="text-center py-6 px-2">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-muted">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm font-medium">Nenhuma observação</p>
                  <p className="text-xs text-muted-foreground mt-1">Registrada hoje.</p>
                </div>
              ) : (
                recentNotes.map((note) => (
                  <div key={note.id} className="p-3 rounded-xl border border-border/60 bg-muted/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">{note.student_name}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{note.note}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-2xl border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/15">
                  <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => setNoteDialogOpen(true)}
                className="w-full justify-start rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 text-indigo-700 dark:text-indigo-300 hover:from-indigo-100 hover:to-violet-100 dark:hover:from-indigo-500/20 dark:hover:to-violet-500/20 border border-indigo-200 dark:border-indigo-500/20 font-medium"
                variant="ghost"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Nova Observação
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl text-muted-foreground"
                disabled
              >
                <Calendar className="mr-2 h-4 w-4" />
                Ver Cronograma Completo
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl text-muted-foreground"
                disabled
              >
                <Activity className="mr-2 h-4 w-4" />
                Relatório de Progresso
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <NewNoteDialog
        isOpen={isNoteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        students={assignedStudents}
      />
    </div>
  );
}
