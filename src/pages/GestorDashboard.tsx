import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, School, HeartHandshake, Loader2, TrendingUp } from "lucide-react";
import { useUsers } from '@/hooks/useUsers';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomReports from "./CustomReports";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconBg,
  delay = "0",
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  delay?: string;
}) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} animate-slide-up delay-${delay} group hover:scale-[1.02] transition-transform duration-300`}>
    {/* Decorative circle */}
    <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10 blur-sm" />
    <div className="absolute -bottom-6 -right-2 h-28 w-28 rounded-full bg-white/5" />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="mt-2 text-4xl font-bold text-white animate-count-up">{value}</p>
        <p className="mt-1 text-xs text-white/60">{subtitle}</p>
      </div>
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${iconBg} shadow-inner-glow`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>

    {/* Bottom bar */}
    <div className="relative mt-4 flex items-center gap-1.5">
      <TrendingUp className="h-3 w-3 text-white/60" />
      <span className="text-[11px] text-white/60">Atualizado em tempo real</span>
    </div>
  </div>
);

export function GestorDashboard() {
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { students, isLoading: isLoadingStudents } = useStudents();
  const { classes, isLoading: isLoadingClasses } = useClasses();
  const isLoading = isLoadingUsers || isLoadingStudents || isLoadingClasses;

  const stats = {
    totalStudents:  students.length,
    totalUsers:     users.length,
    totalCaregivers:users.filter(u => u.role === 'cuidador').length,
    totalClasses:   classes.length,
  };

  const studentsByClass = students.reduce((acc, student) => {
    const className = student.class_name
      ? student.class_name.replace(/\s+/g, ' ').trim()
      : "Sem Turma";
    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartDataStudents = Object.entries(studentsByClass).map(([name, total]) => ({ name, total }));

  const usersByRole = users.reduce((acc, user) => {
    const roleName = { gestor: 'Gestores', cuidador: 'Cuidadores', responsavel: 'Responsáveis', professor: 'Professores' }[user.role] || 'Outros';
    acc[roleName] = (acc[roleName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const PIE_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b"];
  const chartDataUsers = Object.entries(usersByRole).map(([name, value], i) => ({
    name, value, fill: PIE_COLORS[i % PIE_COLORS.length]
  }));

  const statCards = [
    {
      title: "Total de Alunos",
      value: stats.totalStudents,
      subtitle: "Estudantes cadastrados",
      icon: GraduationCap,
      gradient: "bg-gradient-to-br from-indigo-500 to-violet-600",
      iconBg: "bg-white/15",
      delay: "100",
    },
    {
      title: "Total de Usuários",
      value: stats.totalUsers,
      subtitle: "Cuidadores, responsáveis e gestores",
      icon: Users,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      iconBg: "bg-white/15",
      delay: "200",
    },
    {
      title: "Cuidadores Ativos",
      value: stats.totalCaregivers,
      subtitle: "Profissionais de cuidado",
      icon: HeartHandshake,
      gradient: "bg-gradient-to-br from-violet-500 to-purple-700",
      iconBg: "bg-white/15",
      delay: "300",
    },
    {
      title: "Turmas",
      value: stats.totalClasses,
      subtitle: "Turmas cadastradas",
      icon: School,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      iconBg: "bg-white/15",
      delay: "400",
    },
  ];

  return (
    <Tabs defaultValue="overview" className="space-y-6 animate-fade-in">
      <TabsList className="bg-background border border-border/60 rounded-xl p-1 gap-1 h-auto">
        <TabsTrigger
          value="overview"
          className="rounded-lg text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-glow-sm transition-all"
        >
          Visão Geral
        </TabsTrigger>
        <TabsTrigger
          value="reports"
          className="rounded-lg text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-glow-sm transition-all"
        >
          Relatórios Personalizados
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 mt-0">
        {/* Stat Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))
            : statCards.map((c) => <StatCard key={c.title} {...c} />)}
        </div>

        {/* Charts */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          {/* Bar Chart */}
          <Card className="col-span-1 lg:col-span-4 rounded-2xl border-border/60 shadow-card animate-slide-up delay-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Alunos por Turma</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Distribuição de estudantes nas turmas cadastradas.</CardDescription>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/15">
                  <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-[280px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartDataStudents}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="hsl(243,75%,59%)" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(262,83%,58%)" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4, radius: 8 }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 4px 24px hsl(0 0% 0% / 0.12)',
                        color: 'hsl(var(--card-foreground))',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="col-span-1 lg:col-span-3 rounded-2xl border-border/60 shadow-card animate-slide-up delay-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Distribuição de Usuários</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Proporção de cada perfil no sistema.</CardDescription>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/15">
                  <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[280px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 4px 24px hsl(0 0% 0% / 0.12)',
                          fontSize: '12px',
                        }}
                      />
                      <Pie
                        data={chartDataUsers}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={45}
                        paddingAngle={3}
                        labelLine={false}
                      >
                        {chartDataUsers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {chartDataUsers.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                        <span className="text-xs text-muted-foreground">{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="reports">
        <CustomReports />
      </TabsContent>
    </Tabs>
  );
}