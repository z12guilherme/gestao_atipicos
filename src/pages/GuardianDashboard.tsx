import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, FileText, BadgeInfo } from "lucide-react";
 
const calculateAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return '';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    // Verifica se a data é válida
    if (isNaN(birthDateObj.getTime())) {
        return '';
    }
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth(); 
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return `${age} anos`;
};

export default function GuardianDashboard() {
  const { profile, guardianStudents, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Bem-vindo(a), {profile?.name}!</h1>
        <p className="text-muted-foreground">Aqui estão as informações sobre seu(s) estudante(s).</p>
      </div>

      {guardianStudents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>Nenhum estudante vinculado ao seu perfil no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {guardianStudents.map(student => (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{student.name}</CardTitle>
                    <CardDescription>{student.class_name || 'Turma não definida'} - {calculateAge(student.birth_date)}</CardDescription>
                  </div>
                  <Badge variant={student.status === 'ativo' ? 'default' : 'secondary'}>{student.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {student.diagnosis && <div><h4 className="font-semibold flex items-center"><FileText className="mr-2 h-4 w-4"/>Diagnóstico</h4><p className="text-muted-foreground text-sm">{student.diagnosis}</p></div>}
                {student.special_needs && <div><h4 className="font-semibold flex items-center"><BadgeInfo className="mr-2 h-4 w-4"/>Necessidades Especiais</h4><p className="text-muted-foreground text-sm">{student.special_needs}</p></div>}
                {student.medical_info && <div><h4 className="font-semibold flex items-center"><Stethoscope className="mr-2 h-4 w-4"/>Informações Médicas</h4><p className="text-muted-foreground text-sm">{student.medical_info}</p></div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}