import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PdfViewerDialog } from "@/components/shared/PdfViewerDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  GraduationCap, 
  Heart, 
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  FileText,
  Star,
  Download,
  Eye
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
      <div className="flex items-center space-x-3 p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-medium flex-shrink-0">
          {student.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{student.name}</p>
          <p className="text-xs text-muted-foreground truncate">{student.class_name || 'Sem turma'}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {student.laudo_url && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPdfViewerOpen(true)} title="Visualizar Laudo">
              <Eye className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          <Badge variant={student.status === 'ativo' ? 'success' : 'secondary'} className="capitalize text-xs">
            {student.status}
          </Badge>
        </div>
      </div>
    </>
  );
}

export function CuidadorDashboard() {
  const { profile } = useProfile();
  const [isNoteDialogOpen, setNoteDialogOpen] = useState(false);

  const { students, isLoading: isLoadingStudents } = useCaregiverData();
  const { data: dashboardData, isLoading: isLoadingDashboard } = useCaregiverDashboardData();

  const assignedStudents = useMemo(() => {
    return [...students].sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  const isLoading = isLoadingStudents || isLoadingDashboard;

  const recentNotes = dashboardData?.recentNotes || [];
  const todayScheduleCount = dashboardData?.todayScheduleCount || 0;
  const averageRating = "N/A"; // TODO: Buscar dados reais de avaliação

  const hasStudents = assignedStudents.length > 0;
  const hasRecentNotes = recentNotes.length > 0;

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">
              {getWelcomeMessage()}, {profile?.name?.split(' ')[0]}!
            </h1>
            <p className="text-md text-muted-foreground mt-1">
              Acompanhe suas atividades e o progresso dos estudantes.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Hoje</p>
              <p className="text-sm font-medium">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <Button onClick={() => setNoteDialogOpen(true)} size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white shadow">
              <MessageSquare className="mr-2 h-4 w-4" />
              Nova Observação
            </Button>
          </div>
        </CardHeader>
      </Card>


      {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
          </>
        ) : (
          <>
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Estudantes Atribuídos
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{assignedStudents.length}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Sob seus cuidados
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Atividades Hoje
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{todayScheduleCount > 0 ? todayScheduleCount : '-'}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Programadas para hoje
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-violet-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Observações
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{recentNotes.length > 0 ? recentNotes.length : '-'}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Registradas hoje
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/50 dark:to-amber-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Avaliação
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{averageRating}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Média das famílias
            </p>
          </CardContent>
        </Card>
        </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          {/* Componente de gerenciamento de cronograma inserido aqui */}
          <ScheduleManagement />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Students Under Care */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-green-600" />
                <span>Seus Estudantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : !hasStudents ? (
                <div className="text-center py-4 px-2">
                  <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Você ainda não tem estudantes sob seus cuidados.</p>
                  <p className="text-xs text-muted-foreground">Peça a um gestor para atribuir estudantes a você.</p>
                </div>
              ) : (assignedStudents.map((student) => <StudentCard key={student.id} student={student} />))}
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span>Observações Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : !hasRecentNotes ? (
                 <div className="text-center py-4 px-2">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhuma observação registrada hoje.</p>
                </div>
              ) : (
                recentNotes.map((note, index) => (
                  <div key={note.id} className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{note.student_name}</p>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ptBR })}</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.note}</p>
                  </div>
                )))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => setNoteDialogOpen(true)} variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Nova Observação
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Calendar className="mr-2 h-4 w-4" />
                Ver Cronograma Completo
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
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
