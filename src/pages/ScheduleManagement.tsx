import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, PlusCircle, Trash2 } from "lucide-react";
import { useCaregiverStudents } from "@/hooks/useCaregiverStudents";
import { useSchedules } from "@/hooks/useSchedules";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student } from "@/hooks/useStudents";
import { ScheduleImportModal } from "@/components/shared/ScheduleImportModal";

export function ScheduleManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ time: '', activity: '' });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { students: caregiverStudents, loading: studentsLoading } = useCaregiverStudents();
  
  const today = useMemo(() => new Date(), []);
  
  const { schedules, addSchedule, removeSchedule } = useSchedules(selectedStudent?.id || '', today);

  const handleAddActivity = () => {
    if (newActivity.time && newActivity.activity && selectedStudent) {
      addSchedule({
        student_id: selectedStudent.id,
        activity: newActivity.activity,
        start_time: newActivity.time,
        date: today.toISOString().split('T')[0],
      });
      setNewActivity({ time: '', activity: '' });
    }
  };

  const handleRemoveActivity = (id: string) => {
    removeSchedule(id);
  };

  const getStudentName = (studentId: string) => {
    const student = caregiverStudents.find(s => s.id === studentId);
    return student ? student.name : 'Desconhecido';
  }

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Cronograma de Hoje</span>
              </CardTitle>
              <CardDescription>
                Selecione um estudante para ver ou editar o cronograma.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedStudent && (
                <ScheduleImportModal 
                  studentId={selectedStudent.id} 
                  onSuccess={() => {
                    // Invalida todas as queries para garantir a atualização dos dados
                    queryClient.invalidateQueries();
                  }} 
                />
              )}
              <Button variant="outline" size="sm" onClick={() => setModalOpen(true)} disabled={!selectedStudent}>
                Editar Cronograma
              </Button>
            </div>
          </div>
          <div className="pt-4">
              <Select onValueChange={(studentId) => setSelectedStudent(caregiverStudents.find(s => s.id === studentId) || null)} >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um estudante" />
                </SelectTrigger>
                <SelectContent>
                  {studentsLoading ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : (
                    caregiverStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedStudent ? (
            schedules.length > 0 ? schedules.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-600">{item.start_time}</div>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div>
                  <p className="font-medium">{item.activity}</p>
                  <p className="text-sm text-muted-foreground">Com {getStudentName(item.student_id)}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                Agendado
              </Badge>
            </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">Nenhuma atividade agendada para hoje.</p>
            )
          ) : (
            <p className="text-center text-muted-foreground py-4">Selecione um estudante para ver o cronograma.</p>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição do Cronograma */}
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cronograma para {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Lista de atividades existentes com botão de excluir */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {schedules.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                  <span>{item.start_time} - {item.activity}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveActivity(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            {/* Formulário para adicionar nova atividade */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Input placeholder="Hora (HH:MM)" value={newActivity.time} onChange={e => setNewActivity({ ...newActivity, time: e.target.value })} />
              <Input placeholder="Atividade" value={newActivity.activity} onChange={e => setNewActivity({ ...newActivity, activity: e.target.value })} />
              <Button onClick={handleAddActivity} size="icon">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}