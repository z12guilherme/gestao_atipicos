import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ShieldCheck, UserX, AlertTriangle, Activity } from 'lucide-react';

type SecurityLog = {
  id: string;
  event_type: string;
  user_id: string | null;
  ip_address: string | null;
  details: any;
  created_at: string;
};

export function SiemDashboard() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    
    // Configura o real-time listener para novos logs
    const subscription = supabase
      .channel('security_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'security_logs' }, payload => {
        setLogs(current => [payload.new as SecurityLog, ...current]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) {
        console.error('Erro ao buscar logs de segurança', error);
        return;
      }
      
      setLogs(data || []);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_failed': return <UserX className="h-5 w-5 text-orange-500" />;
      case 'unauthorized_access': return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case 'honeytoken_triggered': return <AlertTriangle className="h-5 w-5 text-purple-500" />;
      default: return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const getEventName = (type: string) => {
    switch (type) {
      case 'login_failed': return 'Falha de Login';
      case 'unauthorized_access': return 'Acesso Negado (403)';
      case 'honeytoken_triggered': return 'Armadilha Acionada';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-500" /> Total de Eventos (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{logs.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Segurança (Tempo Real)</CardTitle>
          <CardDescription>Monitoramento ativo contra acessos suspeitos e uso indevido.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando logs...</p>
          ) : logs.length === 0 ? (
            <div className="text-center py-10">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">Nenhum incidente de segurança detectado recentemente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
                  <div className="mt-1 p-2 bg-background rounded-full shadow-sm">
                    {getEventIcon(log.event_type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{getEventName(log.event_type)}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {log.ip_address && (
                      <p className="text-xs text-muted-foreground">IP de Origem: {log.ip_address}</p>
                    )}
                    {log.details && (
                      <pre className="mt-2 text-xs bg-black/5 dark:bg-white/5 p-2 rounded-md overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
