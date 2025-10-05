import { useState } from 'react';
import { UserManagement } from '@/components/gestor/UserManagement';
import { User } from '@/hooks/useUsers';

export function UsersPage() {
  // Estado para controlar se o diálogo de cadastro/edição está aberto
  const [isDialogOpen, setDialogOpen] = useState(false);
  
  // Estado para armazenar os dados do usuário que está sendo editado
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <UserManagement
      isDialogOpen={isDialogOpen}
      setDialogOpen={setDialogOpen}
      editingUser={editingUser}
      setEditingUser={setEditingUser}
    />
  );
}