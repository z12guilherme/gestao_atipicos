import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Student } from '@/hooks/useCaregiverData';

const noteSchema = z.object({
  studentId: z.string().min(1, { message: 'Por favor, selecione um estudante.' }),
  note: z.string().min(10, { message: 'A observação deve ter pelo menos 10 caracteres.' }),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface NewNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  students: Student[];
}

const createNote = async ({ studentId, studentName, note, userId }: { studentId: string; studentName: string; note: string; userId: string }) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ student_id: studentId, student_name: studentName, note, user_id: userId }])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export function NewNoteDialog({ isOpen, onOpenChange, students }: NewNoteDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { studentId: '', note: '' },
  });

  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      toast.success('Observação registrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['caregiverDashboardData'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error('Erro ao registrar observação.', { description: error.message });
    },
  });

  function onSubmit(values: NoteFormValues) {
    if (!user) return;
    const selectedStudent = students.find(s => s.id === values.studentId);
    if (!selectedStudent) return;

    mutation.mutate({
      studentId: values.studentId,
      studentName: selectedStudent.name,
      note: values.note,
      userId: user.id,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Observação</DialogTitle>
          <DialogDescription>
            Registre uma nova observação sobre o comportamento ou progresso de um estudante.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Fields for student selection and note */}
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : 'Salvar Observação'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}