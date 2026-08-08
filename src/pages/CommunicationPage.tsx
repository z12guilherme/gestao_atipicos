import { useState } from 'react';
import { 
  MessageCircle, 
  Calendar, 
  Megaphone, 
  FolderOpen,
  Send,
  Video,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useCommunication } from '@/hooks/useCommunication';
import { format } from 'date-fns';

export function CommunicationPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const { messages, loadingMessages, announcements, loadingAnnouncements, materials, loadingMaterials, meetings, loadingMeetings } = useCommunication();

  return (
    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-sky-950 to-blue-900 p-6 rounded-2xl shadow-glow-sm border border-blue-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-sky-500 rounded-full blur-3xl opacity-20" />
        
        <div className="z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-blue-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comunicação e Família</h1>
            <p className="text-blue-200/80 text-sm mt-1">
              Engajamento escolar, chat seguro, recados e materiais
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50 rounded-xl grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="chat" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat Seguro
          </TabsTrigger>
          <TabsTrigger value="agendamento" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            Reuniões
          </TabsTrigger>
          <TabsTrigger value="mural" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <Megaphone className="w-4 h-4 mr-2" />
            Recados
          </TabsTrigger>
          <TabsTrigger value="materiais" className="rounded-lg px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
            <FolderOpen className="w-4 h-4 mr-2" />
            Materiais
          </TabsTrigger>
        </TabsList>

        {/* TAB: CHAT SEGURO */}
        <TabsContent value="chat" className="h-[500px]">
          <Card className="border-border/50 shadow-sm rounded-2xl h-full flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20 py-3 px-4 flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold">
                  CA
                </div>
                <div>
                  <CardTitle className="text-base">Canal de Atendimento Escolar</CardTitle>
                  <CardDescription className="text-xs text-emerald-500 font-medium">Online • Comunicação Segura</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/10">Canal Oficial</Badge>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
              {loadingMessages ? (
                <p className="text-sm text-center text-muted-foreground">Carregando mensagens...</p>
              ) : messages?.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground">Nenhuma mensagem neste canal.</p>
              ) : (
                messages?.map((msg) => {
                  const isMine = msg.sender?.name === 'Prof. Juliana (Você)'; // Lógica simplificada
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 max-w-[80%] ${isMine ? 'self-end items-end ml-auto' : 'items-start'}`}>
                      <span className={`text-[10px] text-muted-foreground ${isMine ? 'mr-2' : 'ml-2'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')} - {msg.sender?.name}
                      </span>
                      <div className={`p-3 rounded-2xl text-sm ${isMine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-muted rounded-tl-sm border border-border/50'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
            <CardFooter className="border-t border-border/50 p-3 bg-muted/10 shrink-0">
              <form className="flex w-full gap-2 items-center" onSubmit={(e) => e.preventDefault()}>
                <Input placeholder="Digite uma mensagem segura..." className="rounded-xl border-border/60 focus-visible:ring-blue-500" />
                <Button type="submit" size="icon" className="rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* TAB: REUNIÕES */}
        <TabsContent value="agendamento" className="space-y-6">
          <Card className="border-border/50 shadow-sm rounded-2xl bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
                Agenda de Reuniões Multidisciplinares
              </CardTitle>
              <CardDescription>Horários disponíveis e agendamentos confirmados</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {loadingMeetings ? (
                <p className="text-sm text-muted-foreground col-span-full">Carregando reuniões...</p>
              ) : meetings?.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full">Nenhuma reunião agendada.</p>
              ) : (
                meetings?.map((meeting) => (
                  <div className="bg-background/80 p-5 rounded-xl border border-blue-500/20 shadow-sm" key={meeting.id}>
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-emerald-500">{meeting.status}</Badge>
                      <Video className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h4 className="font-bold">{meeting.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{meeting.participants}</p>
                    <div className="mt-4 flex items-center text-sm font-medium">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" /> {format(new Date(meeting.scheduled_at), "EEEE, dd/MM 'às' HH:mm")}
                    </div>
                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Entrar na Sala Virtual</Button>
                  </div>
                ))
              )}
              
              <div className="bg-background/80 p-5 rounded-xl border border-border/50 border-dashed flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="font-medium">Disponibilizar Novo Horário</p>
                <p className="text-xs text-muted-foreground mt-1">Abra agenda para os pais marcarem reuniões</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: MURAL DE RECADOS */}
        <TabsContent value="mural" className="space-y-6">
          <div className="grid gap-4">
            {loadingAnnouncements ? (
              <p className="text-sm text-muted-foreground">Carregando mural...</p>
            ) : announcements?.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum recado no mural.</p>
            ) : (
              announcements?.map((announcement) => (
                <Card key={announcement.id} className="border-border/50 shadow-sm rounded-2xl">
                  <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                      {announcement.requires_signature && (
                        <Badge variant="outline" className="mb-2 bg-rose-500/10 text-rose-600 border-rose-500/20">Autorização Necessária</Badge>
                      )}
                      <h4 className="font-bold text-base">{announcement.title}</h4>
                      <p className="text-sm text-muted-foreground">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">Por: {announcement.profiles?.name} em {format(new Date(announcement.created_at), "dd/MM/yyyy")}</p>
                    </div>
                    {announcement.requires_signature && (
                      <div className="flex flex-col items-end gap-1 text-sm font-medium shrink-0">
                        <span className="text-amber-500">Aguardando Assinatura</span>
                        <Button size="sm" variant="outline">Ver Detalhes</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB: MATERIAIS */}
        <TabsContent value="materiais" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingMaterials ? (
              <p className="text-sm text-muted-foreground col-span-full">Carregando materiais...</p>
            ) : materials?.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">Nenhum material disponível.</p>
            ) : (
              materials?.map((mat) => (
                <Card key={mat.id} className="border-border/50 shadow-sm rounded-2xl hover:border-blue-500/30 transition-colors cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    {mat.type === 'video' ? (
                      <Video className="w-10 h-10 text-indigo-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    ) : (
                      <FileText className="w-10 h-10 text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    )}
                    <h4 className="font-semibold text-sm">{mat.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mat.type.toUpperCase()} • {mat.size_mb} MB
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
