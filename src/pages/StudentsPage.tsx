import { useState } from 'react';
import { StudentManagement } from '@/components/gestor/StudentManagement';
import { Student } from '@/hooks/useStudents';

export function StudentsPage() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Este componente agora atua como um "container" para o estado do modal,
  // permitindo que o botão "Novo Estudante" e a ação de "Editar" na tabela
  // controlem o mesmo Dialog.

  return (
    <div className="flex-1 space-y-4">
      {/* O componente de gerenciamento de estudantes é renderizado aqui */}
      {/* Ele contém a tabela, os botões e a lógica do modal */}
      <StudentManagement
        isDialogOpen={isDialogOpen}
        setDialogOpen={setDialogOpen}
        editingStudent={editingStudent}
        setEditingStudent={setEditingStudent}
      />

      {/* Você pode adicionar outros componentes relacionados a estudantes aqui, se necessário */}
    </div>
  );
}