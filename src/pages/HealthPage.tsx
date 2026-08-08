import { useState } from 'react';
import { 
  HeartPulse, 
  Moon, 
  UtensilsCrossed, 
  Bath, 
  Plus,
  CalendarDays,
  FileText,
  Pill,
  ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHealth } from '@/hooks/useHealth';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

export function HealthPage() {
  const [activeTab, setActiveTab] = useState('diario');
  const { user } = useAuth();
  const { healthLogs, loadingLogs, medications, loadingMedications, administerMedication } = useHealth();

  return (
    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-900 p-6 rounded-2xl shadow-glow-sm border border-emerald-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-teal-500 rounded-full blur-3xl opacity-20" />
        
        <div className="z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <HeartPulse className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Diário de Saúde</h1>
            <p className="text-emerald-200/80 text-sm mt-1">
              Monitoramento diário de sono, alimentação e higiene dos alunos
            </p>
          </div>
        </div>
        
        <div className="z-10 flex gap-3">
          <Button className="shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all rounded-xl font-semibold border-none">
            <Plus className="w-4 h-4 mr-2" />
            Novo Registro
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50 rounded-xl grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="diario" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <HeartPulse className="w-4 h-4 mr-2" />
            Diário de Rotina
          </TabsTrigger>
          <TabsTrigger value="medicacao" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Pill className="w-4 h-4 mr-2" />
            Gestão de Medicação
          </TabsTrigger>
          <TabsTrigger value="alergias" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Alergias e Restrições
          </TabsTrigger>
        </TabsList>

        {/* TAB: DIÁRIO DE SAÚDE */}
        <TabsContent value="diario" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingLogs ? (
              <p className="text-sm text-muted-foreground p-4">Carregando diários...</p>
            ) : healthLogs?.map((log: any) => (
              <Card key={log.id} className="border-border/50 shadow-sm rounded-2xl overflow-hidden bg-background/50 backdrop-blur-sm hover:border-emerald-500/30 transition-colors group">
                <CardHeader className="border-b border-border/50 bg-muted/20 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{log.students?.name || log.student}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <CalendarDays className="w-3 h-3" /> {log.log_date ? format(new Date(log.log_date), 'dd/MM/yyyy') : log.date}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Registrado
                  </Badge>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {/* Sono */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        Sono 
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{log.sleep_quality || log.sleep?.quality || 'N/A'}</Badge>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{log.parents_notes || log.sleep?.notes || 'Sem observações dos pais'}</p>
                    </div>
                  </div>
                  {/* Alimentação */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        Alimentação na Escola
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{log.meal_quality || log.meal?.quality || 'N/A'}</Badge>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{log.school_notes || log.meal?.notes || 'Sem observações'}</p>
                    </div>
                  </div>
                  {/* Banheiro */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                      <Bath className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Higiene / Banheiro</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{log.bathroom_notes || log.bathroom?.notes || 'Nenhuma ida incomum'}</p>
                    </div>
                  </div>
                </CardContent>
                <div className="bg-muted/30 p-3 border-t border-border/50 flex justify-end">
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10">
                    <FileText className="w-3 h-3 mr-1.5" />
                    Ver Detalhes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: MEDICAÇÃO */}
        <TabsContent value="medicacao" className="space-y-6">
          <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden bg-background/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/20 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-500" />
                Cronograma de Medicações
              </CardTitle>
              <CardDescription>Acompanhe e registre a administração de remédios</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {loadingMedications ? (
                  <p className="text-sm text-muted-foreground p-4">Carregando medicações...</p>
                ) : medications?.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4">Nenhuma medicação ativa.</p>
                ) : (
                  medications?.map((med) => (
                    <div key={med.id} className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-sm">{med.students?.name}</h4>
                        <p className="text-xs font-bold text-indigo-500 mt-0.5">{med.name} - {med.dosage}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Horário: {med.schedule}</p>
                        {med.instructions && <p className="text-xs text-muted-foreground mt-0.5 italic">{med.instructions}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => {
                            if (user) {
                              administerMedication.mutate({ medId: med.id, profileId: user.id });
                            }
                          }}
                          disabled={administerMedication.isPending}
                        >
                          Administrar & Notificar Pai
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: ALERGIAS */}
        <TabsContent value="alergias" className="space-y-6">
          <Card className="border-red-500/30 shadow-sm rounded-2xl overflow-hidden bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="w-5 h-5" />
                Mural de Restrições e Alergias Severas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-background/80 p-4 rounded-xl border border-red-500/20 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-red-700">Lucas Silva</h4>
                    <p className="text-sm font-medium mt-1">⚠️ Alergia Severa a Amendoim (Choque Anafilático)</p>
                  </div>
                  <Badge variant="destructive" className="animate-pulse">Risco Alto</Badge>
                </div>
                <div className="bg-background/80 p-4 rounded-xl border border-orange-500/20 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-orange-700">Pedro Costa</h4>
                    <p className="text-sm font-medium mt-1">Seletividade Alimentar Extrema (Não come texturas pastosas)</p>
                  </div>
                  <Badge variant="outline" className="border-orange-500 text-orange-600">Atenção Refeitório</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
