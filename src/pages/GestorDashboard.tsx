import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, School, HeartHandshake } from "lucide-react";
import { useUsers } from '@/hooks/useUsers';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { useProfile } from '@/hooks/useProfile';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell, Tooltip } from "recharts";

export function GestorDashboard() {
  // Hooks para buscar os dados e popular os cards
  const { profile } = useProfile();
  const { users } = useUsers();
  const { students } = useStudents();
  const { classes } = useClasses();

  const stats = {
    totalStudents: students.length,
    totalUsers: users.length,
    totalCaregivers: users.filter(u => u.role === 'cuidador').length,
    totalGuardians: users.filter(u => u.role === 'responsavel').length,
    totalClasses: classes.length,
  };

  // Dados para os gráficos
  const studentsByClass = students.reduce((acc, student) => {
    const className = student.class_name || "Sem Turma";
    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartDataStudents = Object.entries(studentsByClass).map(([name, total]) => ({ name, total }));

  const usersByRole = users.reduce((acc, user) => {
    const roleName = { gestor: 'Gestores', cuidador: 'Cuidadores', responsavel: 'Responsáveis', professor: 'Professores' }[user.role] || 'Outros';
    acc[roleName] = (acc[roleName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const chartDataUsers = Object.entries(usersByRole).map(([name, value]) => ({ name, value, fill: '' }));
  const PIE_COLORS = ["#818cf8", "#a78bfa", "#4ade80", "#f97316"];
  chartDataUsers.forEach((entry, index) => {
    entry.fill = PIE_COLORS[index % PIE_COLORS.length];
  });


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta, {profile?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-muted-foreground">Aqui está um resumo da atividade da sua instituição.</p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Total de Alunos</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-50">{stats.totalStudents}</div>
            <p className="text-xs text-blue-700 dark:text-blue-300">Alunos cadastrados no sistema</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-violet-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{stats.totalUsers}</div>
            <p className="text-xs text-purple-700 dark:text-purple-300">Cuidadores, responsáveis e gestores</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Cuidadores Ativos</CardTitle>
            <HeartHandshake className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-50">{stats.totalCaregivers}</div>
            <p className="text-xs text-green-700 dark:text-green-300">Profissionais de cuidado</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-orange-50 to-amber-100 dark:from-orange-950/50 dark:to-amber-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Turmas</CardTitle>
            <School className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-50">{stats.totalClasses}</div>
            <p className="text-xs text-orange-700 dark:text-orange-300">Turmas cadastradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Alunos por Turma</CardTitle>
            <CardDescription>Distribuição de estudantes nas turmas cadastradas.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartDataStudents}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip cursor={{fill: 'rgba(150, 150, 150, 0.1)'}} />
                <Bar dataKey="total" fill="url(#colorUv)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribuição de Usuários</CardTitle>
            <CardDescription>Proporção de cada perfil no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2 bg-background border rounded-md shadow-lg">
                          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie data={chartDataUsers} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {chartDataUsers.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}