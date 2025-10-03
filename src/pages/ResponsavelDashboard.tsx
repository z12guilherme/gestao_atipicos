import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  Heart, 
  Calendar,
  Clock,
  Activity,
  MessageSquare,
  Phone,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { calculateAge } from "@/lib/utils";

export function ResponsavelDashboard() {
  const { profile, guardianStudents, loading } = useAuth();

  // Mock data - in real app, this would come from API based on guardian relationships
  const recentActivities = [
    { date: "Hoje", activity: "Terapia ocupacional", status: "Concluída", child: "Ana Silva" },
    { date: "Hoje", activity: "Atividade sensorial", status: "Em andamento", child: "Ana Silva" },
    { date: "Ontem", activity: "Apoio pedagógico", status: "Concluída", child: "Ana Silva" },
    { date: "Ontem", activity: "Recreação dirigida", status: "Concluída", child: "Ana Silva" }
  ];

  const upcomingEvents = [
    { date: "Amanhã", time: "14:00", event: "Reunião com cuidador", type: "meeting" },
    { date: "Sex, 04/10", time: "10:00", event: "Avaliação médica", type: "medical" },
    { date: "Seg, 07/10", time: "15:30", event: "Reunião pedagógica", type: "education" }
  ];

  const progressData = [
    { area: "Comunicação", progress: 75, trend: "up" },
    { area: "Coordenação Motora", progress: 60, trend: "up" },
    { area: "Socialização", progress: 85, trend: "stable" },
    { area: "Autonomia", progress: 50, trend: "up" }
  ];

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (loading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {getWelcomeMessage()}, {profile?.name?.split(' ')[0]}!
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Acompanhe o desenvolvimento e as atividades dos seus filhos
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Última atualização</p>
            <p className="text-sm font-medium">{new Date().toLocaleString('pt-BR', { 
              day: 'numeric', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</p>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contatar Cuidador
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/50 dark:to-red-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Meus Filhos
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{guardianStudents.length}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Cadastrados no sistema
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Atividades Hoje
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {recentActivities.filter(a => a.date === 'Hoje').length}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Programadas
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Próximos Eventos
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{upcomingEvents.length}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-violet-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Progresso Geral
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {Math.round(progressData.reduce((acc, curr) => acc + curr.progress, 0) / progressData.length)}%
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Média de desenvolvimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress and Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Progresso de Desenvolvimento</span>
              </CardTitle>
              <CardDescription>
                Acompanhe as principais áreas de desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {progressData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{item.area}</span>
                      {item.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                      {item.trend === 'stable' && <div className="h-3 w-3 rounded-full bg-yellow-500" />}
                    </div>
                    <span className="text-sm text-muted-foreground">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Atividades Recentes</span>
              </CardTitle>
              <CardDescription>
                Últimas atividades realizadas pelos seus filhos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <div className="text-xs font-medium text-muted-foreground">{activity.date}</div>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div>
                      <p className="text-sm font-medium">{activity.activity}</p>
                      <p className="text-xs text-muted-foreground">{activity.child}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={activity.status === 'Concluída' ? 'default' : 'secondary'}
                    className={activity.status === 'Concluída' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                  >
                    {activity.status === 'Concluída' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* My Children */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-orange-600" />
                <span>Meus Filhos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {guardianStudents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum filho cadastrado</p>
              ) : (
                guardianStudents.map((child) => (
                  <div key={child.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-medium">
                        {child.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{child.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {child.class_name || 'Sem turma'} • {calculateAge(child.birth_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={child.status === 'ativo' ? 'default' : 'secondary'} className="text-xs">
                        {child.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Próximos Eventos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{event.event}</p>
                    <Badge variant="outline" className="text-xs">
                      {event.type === 'meeting' && 'Reunião'}
                      {event.type === 'medical' && 'Médico'}
                      {event.type === 'education' && 'Pedagógico'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{event.date} às {event.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm">Contatos Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Cuidador Principal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="mr-2 h-4 w-4" />
                Coordenação
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
