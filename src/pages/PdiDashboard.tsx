import { useState } from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  Target, 
  Award, 
  Smile,
  AlertTriangle,
  WifiOff,
  User,
  Download,
  BookOpen,
  Paperclip
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePdi } from '@/hooks/usePdi';
import { format } from 'date-fns';

export function PdiDashboard() {
  const [activeTab, setActiveTab] = useState('evolucao');
  const { 
    records, loadingRecords, 
    achievements, loadingAchievements,
    goals, loadingGoals,
    triggers, loadingTriggers
  } = usePdi();

  return (
    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-violet-900 via-fuchsia-950 to-violet-900 p-6 rounded-2xl shadow-glow-sm border border-violet-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-violet-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-fuchsia-500 rounded-full blur-3xl opacity-20" />
        
        <div className="z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <BrainCircuit className="h-6 w-6 text-violet-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Evolução e PDI</h1>
            <p className="text-violet-200/80 text-sm mt-1">
              Plano de Desenvolvimento Individual e Análise Comportamental
            </p>
          </div>
        </div>
        
        <div className="z-10 flex gap-3">
          <Button variant="secondary" className="shadow-lg hover:shadow-xl transition-all rounded-xl font-semibold">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50 rounded-xl grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="evolucao" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Evolução PDI
          </TabsTrigger>
          <TabsTrigger value="anedotario" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <BookOpen className="w-4 h-4 mr-2" />
            Anedotário
          </TabsTrigger>
          <TabsTrigger value="gatilhos" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Gatilhos
          </TabsTrigger>
          <TabsTrigger value="gamificacao" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <Award className="w-4 h-4 mr-2" />
            Conquistas
          </TabsTrigger>
        </TabsList>

        {/* TAB: EVOLUÇÃO PDI */}
        <TabsContent value="evolucao" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 shadow-sm rounded-2xl md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-500" />
                  Metas do Semestre
                </CardTitle>
                <CardDescription>Progresso das habilidades motoras e cognitivas (Mock)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingGoals ? (
                  <p className="text-sm text-muted-foreground">Carregando metas...</p>
                ) : goals?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma meta registrada.</p>
                ) : (
                  goals?.map((goal) => (
                    <div className="space-y-2" key={goal.id}>
                      <div className="flex justify-between text-sm font-medium">
                        <span>{goal.title}</span>
                        <span className={`text-${goal.color}-500`}>{goal.progress_percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full bg-${goal.color}-500 rounded-full`} style={{ width: `${goal.progress_percentage}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm rounded-2xl bg-violet-500/5">
              <CardHeader>
                <CardTitle className="text-lg text-violet-700 dark:text-violet-400">Resumo Multidisciplinar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "O aluno tem demonstrado excelente adaptação à nova rotina. As intervenções fonoaudiológicas refletiram em 30% a mais de engajamento na sala de aula."
                </p>
                <div className="pt-4 flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-background flex items-center justify-center text-[10px] text-white font-bold">TO</div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-[10px] text-white font-bold">FONO</div>
                  <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-background flex items-center justify-center text-[10px] text-white font-bold">PSI</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: ANEDOTÁRIO */}
        <TabsContent value="anedotario" className="space-y-6">
          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Diário de Bordo / Anedotário</CardTitle>
                <CardDescription>Observações diárias da equipe escolar</CardDescription>
              </div>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                <Paperclip className="w-4 h-4 mr-2" /> Anexar Mídia (Vídeo/Foto)
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 border-l-2 border-violet-200 dark:border-violet-900 ml-3 pl-6 relative">
                {loadingRecords ? (
                  <p className="text-sm text-muted-foreground">Carregando anedotário...</p>
                ) : records?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
                ) : (
                  records?.map((record, idx) => (
                    <div className="relative" key={record.id}>
                      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full ${idx % 2 === 0 ? 'bg-violet-500' : 'bg-indigo-500'} ring-4 ring-background`} />
                      <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-2">
                        {format(new Date(record.created_at), "dd/MM 'às' HH:mm")} - {record.profiles?.name || 'Profissional'}
                        {idx === 0 && (
                          <Badge variant="secondary" className="text-[9px] h-4">
                            <WifiOff className="w-3 h-3 mr-1" /> Offline
                          </Badge>
                        )}
                      </p>
                      <div className="text-sm bg-muted/50 p-3 rounded-xl border border-border/50">
                        <strong className="block mb-1">{record.students?.name || 'Aluno'} - {record.title}</strong>
                        <p>{record.content}</p>
                        {record.media_url && (
                          <div className="mt-2 p-2 bg-background rounded-lg border border-border/50 inline-flex items-center text-xs text-violet-600 font-medium cursor-pointer hover:bg-violet-50">
                            <Paperclip className="w-3 h-3 mr-2" /> Anexo
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: GATILHOS */}
        <TabsContent value="gatilhos" className="space-y-6">
          <Card className="border-border/50 shadow-sm rounded-2xl border-orange-500/20 bg-orange-500/5">
            <CardHeader>
              <CardTitle className="text-orange-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Mapeamento de Gatilhos
              </CardTitle>
              <CardDescription>Padrões detectados pela IA (Mock)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingTriggers ? (
                <p className="text-sm text-muted-foreground">Carregando gatilhos...</p>
              ) : triggers?.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum gatilho mapeado.</p>
              ) : (
                triggers?.map((trigger) => (
                  <div className="p-4 bg-background/80 rounded-xl border border-orange-500/20" key={trigger.id}>
                    <p className="text-sm font-medium">💡 Insight do Sistema:</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {trigger.insight_text}
                      <br /><br />
                      <strong>Sugestão:</strong> {trigger.suggestion_text}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: GAMIFICAÇÃO */}
        <TabsContent value="gamificacao" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingAchievements ? (
              <p className="text-sm text-muted-foreground col-span-full">Carregando conquistas...</p>
            ) : achievements?.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">Nenhuma conquista registrada ainda.</p>
            ) : (
              achievements?.map((achievement) => (
                <Card key={achievement.id} className="border-border/50 shadow-sm rounded-2xl bg-emerald-500/10 border-emerald-500/30 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mb-3">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">{achievement.title}</h3>
                  <p className="text-xs font-bold text-emerald-600 mt-1">{achievement.students?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                </Card>
              ))
            )}
            
            {/* Card Fixo de Próxima Conquista */}
            <Card className="border-border/50 shadow-sm rounded-2xl bg-amber-500/10 border-amber-500/30 flex flex-col items-center justify-center p-6 text-center opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center mb-3">
                <Smile className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-amber-700 dark:text-amber-400">Herói do Foco</h3>
              <p className="text-xs text-muted-foreground mt-1">Completar 10 atividades seguidas</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
