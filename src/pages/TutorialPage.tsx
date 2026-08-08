import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ShieldCheck, BookOpen, Activity, Lock, ArrowLeft, Server, CheckCircle, Sparkles, Users, UserCog, Heart } from "lucide-react";

const profiles = [
  {
    icon: UserCog,
    color: "from-indigo-500 to-violet-600",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    ring: "ring-1 ring-indigo-200 dark:ring-indigo-500/20",
    label: "Gestores",
    labelColor: "text-indigo-700 dark:text-indigo-300",
    desc: "Administração total: cadastre usuários, alunos e turmas. Gerencie vínculos entre cuidadores e responsáveis e visualize relatórios gerais.",
  },
  {
    icon: Heart,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    ring: "ring-1 ring-emerald-200 dark:ring-emerald-500/20",
    label: "Cuidadores",
    labelColor: "text-emerald-700 dark:text-emerald-300",
    desc: "Foco no dia a dia: registre observações diárias, acompanhe o cronograma e relate o progresso dos estudantes atribuídos a você.",
  },
  {
    icon: Users,
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    ring: "ring-1 ring-amber-200 dark:ring-amber-500/20",
    label: "Responsáveis",
    labelColor: "text-amber-700 dark:text-amber-300",
    desc: "Acompanhamento transparente: visualize o cronograma, leia as observações dos cuidadores e acompanhe o desenvolvimento do seu filho.",
  },
];

const securityItems = [
  {
    icon: Lock,
    title: "Conformidade com a LGPD",
    desc: "O sistema foi desenhado seguindo os princípios da Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Coletamos apenas os dados estritamente necessários para a prestação do serviço de cuidado (Minimização de Dados) e garantimos que o acesso seja restrito apenas aos profissionais vinculados ao estudante.",
  },
  {
    icon: Server,
    title: "Infraestrutura Segura",
    desc: "Utilizamos criptografia de ponta a ponta. Seus dados são armazenados em servidores seguros com backups automáticos, garantindo a integridade e disponibilidade das informações.",
  },
];

const techItems = [
  {
    icon: CheckCircle,
    title: "Sistema Testado",
    desc: "O Gestão Atípicos passou por rigorosos testes de funcionalidade e segurança antes de ser disponibilizado, garantindo uma experiência estável e livre de erros críticos.",
  },
  {
    icon: Activity,
    title: "Monitoramento SIEM",
    desc: "Contamos com um sistema SIEM (Security Information and Event Management) integrado, monitorando eventos de segurança em tempo real para detectar e responder a qualquer anomalia.",
  },
];

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-mesh pb-12">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-violet-800/30 blur-xl" />
        <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-16">
          <Link to="/auth">
            <Button variant="ghost" className="mb-6 text-white/80 hover:text-white hover:bg-white/10 rounded-xl -ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Login
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 border border-white/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest">Documentação</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Sobre o Gestão Atípicos
          </h1>
          <p className="text-indigo-100/80 text-base md:text-lg mt-3 max-w-2xl leading-relaxed">
            Guia completo de uso, segurança e conformidade com a LGPD para todos os perfis de acesso.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Section 1: How to use */}
        <section className="animate-slide-up delay-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/15">
              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Como Usar o Sistema</h2>
              <p className="text-xs text-muted-foreground">Uma visão geral das funcionalidades para cada perfil.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {profiles.map((p, i) => (
              <div key={p.label} className={`p-5 rounded-2xl ${p.bg} ${p.ring} animate-slide-up delay-${(i + 1) * 100}`}>
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} shadow-lg mb-4`}>
                  <p.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className={`font-bold text-base mb-2 ${p.labelColor}`}>{p.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Security */}
        <section className="animate-slide-up delay-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/15">
              <ShieldCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Segurança e LGPD</h2>
              <p className="text-xs text-muted-foreground">Nosso compromisso com a proteção dos seus dados.</p>
            </div>
          </div>
          <Card className="rounded-2xl border-border/60 shadow-card">
            <CardContent className="p-6 space-y-6">
              {securityItems.map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/15">
                    <item.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Tech reliability */}
        <section className="animate-slide-up delay-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/15">
              <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Confiabilidade Técnica</h2>
              <p className="text-xs text-muted-foreground">Tecnologia testada e monitorada.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {techItems.map((item, i) => (
              <Card key={item.title} className={`rounded-2xl border-border/60 shadow-card animate-slide-up delay-${(i + 3) * 100}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
                      <item.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <div className="text-center pt-4 animate-fade-in delay-500">
          <Link to="/auth">
            <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-glow-sm px-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}