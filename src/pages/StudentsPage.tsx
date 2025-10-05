import { useState } from 'react';
import { StudentManagement } from '@/components/gestor/StudentManagement';
import { Student } from '@/hooks/useStudents';

export function StudentsPage() {
  // Estado para controlar se o diálogo está aberto ou fechado
  const [isDialogOpen, setDialogOpen] = useState(false);
  
  // Estado para armazenar os dados do estudante que está sendo editado
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  return (
    <StudentManagement
      isDialogOpen={isDialogOpen}
      setDialogOpen={setDialogOpen}
      editingStudent={editingStudent}
      setEditingStudent={setEditingStudent}
    />
  );
}