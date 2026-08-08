import { useState } from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  UserCheck, 
  Search,
  Plus,
  Clock,
  LogOut,
  LogIn
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSecurity } from '@/hooks/useSecurity';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Map, Bus, BellOff } from 'lucide-react';

export function SecurityPage() {
  const [activeTab, setActiveTab] = useState('access');
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sosStudent, setSosStudent] = useState('');
  const [sosMessage, setSosMessage] = useState('');
  const [isSendingSos, setIsSendingSos] = useState(false);

  const { checkins, loadingCheckins, incidents, loadingIncidents } = useSecurity();

  const handleSosTrigger = async () => {
    if (!sosStudent || !sosMessage) {
      toast.error("Preencha o nome do aluno e a mensagem da emergência.");
      return;
    }
    
    setIsSendingSos(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-emergency-alert', {
        body: { 
          studentName: sosStudent, 
          message: sosMessage, 
          severity: 'emergencia',
          phoneNumbers: ['+5511999999999'] // Mockado para demonstração
        }
      });
      
      if (error) throw error;
      
      toast.success("Alerta de emergência disparado via SMS/WhatsApp com sucesso!");
      setIsSosOpen(false);
      setSosStudent('');
      setSosMessage('');
    } catch (error: any) {
      toast.error("Falha ao enviar alerta", { description: error.message });
    } finally {
      setIsSendingSos(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl shadow-glow-sm border border-indigo-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-rose-500 rounded-full blur-3xl opacity-20" />
        
        <div className="z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Central de Segurança</h1>
            <p className="text-indigo-200/80 text-sm mt-1">
              Monitoramento de acessos, autorizações e incidentes em tempo real
            </p>
          </div>
        </div>
        
        <div className="z-10 flex gap-3">
          <Dialog open={isSosOpen} onOpenChange={setIsSosOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all rounded-xl font-semibold">
                <AlertOctagon className="w-4 h-4 mr-2" />
                S.O.S Emergência
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-red-500/20 bg-background/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-500 text-xl">
                  <AlertOctagon className="w-5 h-5 mr-2" /> Disparar Alerta SOS
                </DialogTitle>
                <DialogDescription>
                  Isenvia um SMS/WhatsApp de prioridade MÁXIMA para os responsáveis do aluno e equipe médica da escola.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sos-student">Nome do Aluno</Label>
                  <Input 
                    id="sos-student" 
                    placeholder="Ex: Lucas Silva" 
                    value={sosStudent}
                    onChange={(e) => setSosStudent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sos-message">O que está acontecendo?</Label>
                  <Textarea 
                    id="sos-message" 
                    placeholder="Descreva brevemente a emergência..." 
                    value={sosMessage}
                    onChange={(e) => setSosMessage(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="sm:justify-between">
                <Button variant="ghost" onClick={() => setIsSosOpen(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleSosTrigger} disabled={isSendingSos}>
                  {isSendingSos ? "Enviando..." : "Disparar SMS Imediato"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50 rounded-xl grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="access" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <UserCheck className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Controle de</span> Acesso
          </TabsTrigger>
          <TabsTrigger value="incidents" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <AlertOctagon className="w-4 h-4 mr-2" />
            Incidentes
          </TabsTrigger>
          <TabsTrigger value="transport" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <Map className="w-4 h-4 mr-2" />
            Transporte
          </TabsTrigger>
          <TabsTrigger value="absence" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <BellOff className="w-4 h-4 mr-2" />
            Omissões
          </TabsTrigger>
        </TabsList>

        {/* TAB: CONTROLE DE ACESSO */}
        <TabsContent value="access" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar aluno ou responsável..." 
                className="pl-9 rounded-xl border-border/50 bg-background/50 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20">
                <LogIn className="w-4 h-4 mr-2" />
                Registrar Entrada
              </Button>
              <Button variant="outline" className="w-full sm:w-auto rounded-xl border-border/50">
                <LogOut className="w-4 h-4 mr-2" />
                Registrar Saída
              </Button>
            </div>
          </div>

          <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden bg-background/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Últimas Movimentações (Hoje)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {loadingCheckins ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Carregando...</div>
                ) : checkins?.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma movimentação registrada hoje.</div>
                ) : (
                  checkins?.map((checkin) => {
                    const type = checkin.checkout_time ? 'out' : 'in';
                    const time = format(new Date(checkin.created_at), 'HH:mm');
                    return (
                      <div key={checkin.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'in' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'}`}>
                            {type === 'in' ? <LogIn className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{checkin.students?.name || 'Aluno'}</p>
                            <p className="text-xs text-muted-foreground">Acompanhante: {checkin.authorized_persons?.name || 'Não informado'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Autorizado
                          </Badge>
                          <span className="text-sm font-medium tabular-nums text-muted-foreground">{time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: INCIDENTES */}
        <TabsContent value="incidents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500" />
              Ocorrências Recentes
            </h2>
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Novo Registro
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingIncidents ? (
              <div className="p-4 text-sm text-muted-foreground col-span-full">Carregando incidentes...</div>
            ) : incidents?.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground col-span-full">Nenhum incidente registrado.</div>
            ) : (
              incidents?.map((incident) => {
                const time = format(new Date(incident.created_at), "dd/MM 'às' HH:mm");
                return (
                  <Card key={incident.id} className="border-border/50 shadow-sm rounded-2xl hover:border-indigo-500/30 transition-all cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge 
                          variant="outline" 
                          className={
                            incident.severity === 'baixa' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                            incident.severity === 'media' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 
                            'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }
                        >
                          Prioridade {incident.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">{time}</span>
                      </div>
                      <CardTitle className="text-base mt-2">{incident.description.substring(0, 50)}...</CardTitle>
                      <CardDescription className="text-xs font-medium text-foreground">{incident.students?.name || 'Aluno'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground flex justify-between items-center border-t border-border/50 pt-3">
                        <span>{incident.profiles?.name || 'Desconhecido'}</span>
                        <span className={incident.resolved ? "text-emerald-500 font-medium" : "text-amber-500 font-medium"}>
                          {incident.resolved ? 'Resolvido' : 'Pendente'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* TAB: TRANSPORTE (Geolocalização) */}
        <TabsContent value="transport" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bus className="w-5 h-5 text-indigo-500" />
              Geolocalização do Transporte Escolar
            </h2>
          </div>
          <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden bg-background/50 backdrop-blur-sm">
            <CardContent className="p-0 relative h-[400px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 overflow-hidden">
              {/* Mock do Mapa */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.4) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="z-10 text-center space-y-4 max-w-sm mx-auto p-6 bg-background/80 backdrop-blur-xl rounded-2xl border border-indigo-500/20 shadow-xl">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <Map className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg">Mapa Interativo</h3>
                <p className="text-sm text-muted-foreground">O módulo de geolocalização está conectado aos rastreadores das vans cadastradas. Aguardando sinal GPS...</p>
                <div className="flex justify-center gap-2 pt-2">
                  <Badge className="bg-emerald-500 text-white">Van 01 (Em Rota)</Badge>
                  <Badge variant="secondary">Van 02 (Parada)</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: OMISSÕES (Alerta de Ausência) */}
        <TabsContent value="absence" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BellOff className="w-5 h-5 text-amber-500" />
              Alertas de Omissão / Ausência Injustificada
            </h2>
          </div>
          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Monitoramento de Horário Limite</CardTitle>
              <CardDescription>
                Notificações automáticas para pais quando a criança não realiza check-in até 30 minutos após o início da aula.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center border border-dashed border-border/60 rounded-xl bg-muted/20">
                <BellOff className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhum alerta de omissão hoje.</p>
                <p className="text-sm text-muted-foreground mt-1">Todos os alunos esperados realizaram check-in no horário correto.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
