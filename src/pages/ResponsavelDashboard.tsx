import { useGuardianData } from "@/hooks/useGuardianData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ResponsavelDashboard() {
  const { data, isLoading } = useGuardianData();
  const students = data?.students || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[400px]">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-6 text-xl font-semibold">Nenhum filho cadastrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Parece que não há estudantes vinculados ao seu perfil. Por favor, entre em contato com a gestão.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel do Responsável</h1>
        <p className="text-muted-foreground">Acompanhe as observações e o dia a dia do(s) seu(s) filho(s).</p>
      </div>

      {students.map((student) => (
        <Card key={student.id} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 bg-muted/50 p-4">
            <Avatar className="h-12 w-12">
              {/* A foto do estudante pode ser adicionada aqui no futuro */}
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <CardTitle className="text-xl">{student.name}</CardTitle>
              <CardDescription>{student.class_name || "Turma não definida"}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <h3 className="mb-4 text-lg font-semibold flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Últimas Observações dos Cuidadores
            </h3>
            {student.reports && student.reports.length > 0 ? (
              <div className="space-y-4">
                {student.reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-lg border bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">
                        {report.profiles?.name || "Cuidador"}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma observação registrada para este estudante ainda.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}