import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  GraduationCap, 
  UserPlus, 
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Heart,
  UserCheck,
  LogOut,
  Activity
} from "lucide-react";
import { UserManagement } from "@/components/gestor/UserManagement";
import { StudentManagement } from "@/components/gestor/StudentManagement";
import { AssignmentManagement } from "@/components/gestor/AssignmentManagement";
import { useUsers, User } from "@/hooks/useUsers";
import { useStudents, Student } from "@/hooks/useStudents";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function GestorDashboard() {
  const { users } = useUsers();
  const { students } = useStudents();
  const { signOut } = useAuth();

  const [activeTab, setActiveTab] = useState("users");
  const [isUserDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isStudentDialogOpen, setStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const caregivers = users.filter(user => user.role === 'cuidador');
  const guardians = users.filter(user => user.role === 'responsavel');
  const activeStudents = students.filter(student => student.status === 'ativo');
  const inactiveStudents = students.filter(student => student.status === 'inativo');
  const transferredStudents = students.filter(student => student.status === 'transferido');

  const studentsWithSpecialNeeds = students.filter(student => 
    student.special_needs && student.special_needs.trim() !== ''
  );

  const recentStudents = students
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia!";
    if (hour < 18) return "Boa tarde!";
    return "Boa noite!";
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-800 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {getWelcomeMessage()}
            </h1>
            <p className="text-lg text-muted-foreground">
              Aqui está um resumo do seu sistema de gestão.
            </p>
          </div>
          <div className="hidden border-l border-gray-300 pl-4 dark:border-gray-700 md:block">
            <p className="text-sm text-muted-foreground">Data e Hora</p>
            <p className="text-sm font-medium">{new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-start gap-2 md:w-auto md:justify-end">
          <Button onClick={() => { setActiveTab("users"); setEditingUser(null); setUserDialogOpen(true); }}>
            <UserPlus className="mr-2 h-4 w-4" /> Novo Usuário
          </Button>
          <Button variant="outline" onClick={() => { setActiveTab("students"); setEditingStudent(null); setStudentDialogOpen(true); }}>
            <GraduationCap className="mr-2 h-4 w-4" /> Novo Estudante
          </Button>
          <Button variant="outline" onClick={() => toast.info("Em breve!", { description: "A funcionalidade de relatórios está em desenvolvimento." })}>
            <Activity className="mr-2 h-4 w-4" /> Relatórios
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut} className="ml-2">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Estudantes Ativos
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{activeStudents.length}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              +{students.length - activeStudents.length} inativos/transferidos
            </p>
            <Progress value={(activeStudents.length / students.length) * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Cuidadores
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{caregivers.length}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Equipe especializada
            </p>
            <div className="flex items-center mt-3 space-x-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">Todos ativos</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/50 dark:to-red-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Responsáveis
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{guardians.length}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Famílias cadastradas
            </p>
            <div className="flex items-center mt-3 space-x-2">
              <TrendingUp className="h-3 w-3 text-orange-600" />
              <span className="text-xs text-orange-600">Engajamento alto</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950/50 dark:to-indigo-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Necessidades Especiais
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{studentsWithSpecialNeeds.length}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Requerem atenção especial
            </p>
            <Progress 
              value={(studentsWithSpecialNeeds.length / students.length) * 100} 
              className="mt-3 h-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Estudantes Cadastrados Recentemente</span>
              </CardTitle>
              <CardDescription>
                Últimos 5 estudantes adicionados ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentStudents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum estudante cadastrado ainda</p>
              ) : (
                recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.class_name || 'Sem turma'} • {student.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={student.status === 'ativo' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(student.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="border-0 shadow-lg mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estudantes Ativos</span>
                <Badge variant="default">{((activeStudents.length / students.length) * 100).toFixed(0)}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cuidadores</span>
                <Badge variant="secondary">{caregivers.length} ativos</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Responsáveis</span>
                <Badge variant="outline">{guardians.length} cadastrados</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Management Tabs */}
      <Card className="border-0 shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Estudantes</span>
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Atribuições</span>
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <TabsContent value="users" className="mt-0">
            <UserManagement 
              isDialogOpen={isUserDialogOpen}
              setDialogOpen={setUserDialogOpen}
              editingUser={editingUser}
              setEditingUser={setEditingUser}
            />
          </TabsContent>
          
          <TabsContent value="students" className="mt-0">
            <StudentManagement 
              isDialogOpen={isStudentDialogOpen}
              setDialogOpen={setStudentDialogOpen}
              editingStudent={editingStudent}
              setEditingStudent={setEditingStudent}
            />
          </TabsContent>
          
          <TabsContent value="assignments" className="mt-0">
            <AssignmentManagement />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}