import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ShieldCheck, BookOpen, Activity, Lock, ArrowLeft, Server, CheckCircle } from "lucide-react";

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sobre o Gestão Atípicos
            </h1>
            <p className="text-muted-foreground mt-2">
              Guia de uso, segurança e conformidade com a LGPD.
            </p>
          </div>
          <Link to="/auth">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Login
            </Button>
          </Link>
        </div>

        {/* Seção 1: Visão Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Como Usar o Sistema
            </CardTitle>
            <CardDescription>Uma visão geral das funcionalidades para cada perfil.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Gestores</h3>
              <p className="text-sm text-muted-foreground">
                Administração total: cadastre usuários, alunos e turmas. Gerencie vínculos entre cuidadores e responsáveis e visualize relatórios gerais.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Cuidadores</h3>
              <p className="text-sm text-muted-foreground">
                Foco no dia a dia: registre observações diárias, acompanhe o cronograma e relate o progresso dos estudantes atribuídos a você.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
              <h3 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Responsáveis</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhamento transparente: visualize o cronograma, leia as observações dos cuidadores e acompanhe o desenvolvimento do seu filho.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: LGPD e Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-purple-500" />
              Segurança e LGPD
            </CardTitle>
            <CardDescription>Nosso compromisso com a proteção dos seus dados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-start">
              <Lock className="h-6 w-6 text-purple-600 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold">Conformidade com a LGPD</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  O sistema foi desenhado seguindo os princípios da Lei Geral de Proteção de Dados (Lei nº 13.709/2018). 
                  Coletamos apenas os dados estritamente necessários para a prestação do serviço de cuidado (Minimização de Dados) 
                  e garantimos que o acesso a essas informações seja restrito apenas aos profissionais vinculados ao estudante (Controle de Acesso).
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <Server className="h-6 w-6 text-purple-600 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold">Infraestrutura Segura</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Utilizamos criptografia de ponta a ponta. Seus dados são armazenados em servidores seguros com backups automáticos, 
                  garantindo a integridade e disponibilidade das informações.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 3: Confiabilidade Técnica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Confiabilidade Técnica
            </CardTitle>
            <CardDescription>Tecnologia testada e monitorada.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Sistema Testado
              </h3>
              <p className="text-sm text-muted-foreground">
                O Gestão Atípicos passou por rigorosos testes de funcionalidade e segurança antes de ser disponibilizado, 
                garantindo uma experiência estável e livre de erros críticos.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" />
                Monitoramento SIEM
              </h3>
              <p className="text-sm text-muted-foreground">
                Contamos com um sistema de SIEM (Security Information and Event Management) integrado. 
                Isso significa que monitoramos eventos de segurança em tempo real para detectar e responder a qualquer anomalia imediatamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}