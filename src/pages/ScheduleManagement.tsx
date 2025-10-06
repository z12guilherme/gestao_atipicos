import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, PlusCircle, Trash2 } from "lucide-react";

// Mock de dados para o cronograma. Em uma aplicação real, viria de uma API.
const initialSchedule = [
  { id: 1, time: "08:00", activity: "Acolhimento matinal", student: "Ana Silva" },
  { id: 2, time: "09:30", activity: "Atividade sensorial", student: "João Santos" },
  { id: 3, time: "11:00", activity: "Apoio pedagógico", student: "Maria Costa" },
  { id: 4, time: "14:00", activity: "Terapia ocupacional", student: "Ana Silva" },
  { id: 5, time: "15:30", activity: "Recreação dirigida", student: "João Santos" }
];

export function ScheduleManagement() {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ time: '', activity: '', student: '' });

  const handleAddActivity = () => {
    if (newActivity.time && newActivity.activity && newActivity.student) {
      setSchedule([...schedule, { ...newActivity, id: Date.now() }]);
      setNewActivity({ time: '', activity: '', student: '' });
    }
  };

  const handleRemoveActivity = (id: number) => {
    setSchedule(schedule.filter(item => item.id !== id));
  };

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
                Suas atividades programadas para hoje.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
              Editar Cronograma
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {schedule.length > 0 ? schedule.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-600">{item.time}</div>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div>
                  <p className="font-medium">{item.activity}</p>
                  <p className="text-sm text-muted-foreground">Com {item.student}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                Agendado
              </Badge>
            </div>
          )) : (
            <p className="text-center text-muted-foreground py-4">Nenhuma atividade agendada para hoje.</p>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição do Cronograma */}
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cronograma do Dia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Lista de atividades existentes com botão de excluir */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {schedule.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                  <span>{item.time} - {item.activity} ({item.student})</span>
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
              <Input placeholder="Estudante" value={newActivity.student} onChange={e => setNewActivity({ ...newActivity, student: e.target.value })} />
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