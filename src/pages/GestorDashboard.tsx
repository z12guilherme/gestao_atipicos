import { useState } from "react";
import { UserManagement } from "@/components/gestor/UserManagement";
import { StudentManagement } from "@/components/gestor/StudentManagement";
import { AssignmentManagement } from "@/components/gestor/AssignmentManagement";
import { ClassManagement } from "@/components/gestor/ClassManagement";
import { User } from "@/hooks/useUsers";
import { Student } from "@/hooks/useStudents";

export function GestorDashboard() {
  // Estado para controlar o modal de usuários
  const [isUserDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Estado para controlar o modal de estudantes
  const [isStudentDialogOpen, setStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Estado para controlar o modal de turmas
  const [isClassDialogOpen, setClassDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Adicione aqui os cards de estatísticas se desejar */}
        
        <UserManagement 
          isDialogOpen={isUserDialogOpen}
          setDialogOpen={setUserDialogOpen}
          editingUser={editingUser}
          setEditingUser={setEditingUser}
        />

        <StudentManagement 
          isDialogOpen={isStudentDialogOpen}
          setDialogOpen={setStudentDialogOpen}
          editingStudent={editingStudent}
          setEditingStudent={setEditingStudent}
        />

        <ClassManagement 
          isDialogOpen={isClassDialogOpen}
          setDialogOpen={setClassDialogOpen}
        />

        <AssignmentManagement />
      </div>
    </div>
  );
}