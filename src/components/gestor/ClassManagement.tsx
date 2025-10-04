import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { School, Edit, Save, Trash2, Loader2, FileX2 } from "lucide-react";
import { useClasses, Class } from "@/hooks/useClasses";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProfile } from "@/hooks/useProfile";

const classSchema = z.object({
  name: z.string({ required_error: "O nome da turma é obrigatório." }).trim().min(2, "O nome deve ter pelo menos 2 caracteres."),
});

type ClassFormData = z.infer<typeof classSchema>;

export function ClassManagement() {
  const { profile } = useProfile();
  const { classes, isLoading, createClass, updateClass, deleteClass } = useClasses();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  });

  const handleOpenEditModal = (cls: Class) => {
    setEditingClass(cls);
    reset({ name: cls.name });
    setDialogOpen(true);
  };

  const handleDialogChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {
      reset({ name: '' });
      setEditingClass(null);
    }
  };

  const onSubmit = async (data: ClassFormData) => {
    if (editingClass) {
      await updateClass.mutateAsync({ id: editingClass.id, ...data });
    } else {
      await createClass.mutateAsync(data);
    }
    handleDialogChange(false);
  };

  if (profile?.role !== 'gestor') {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciar Turmas</CardTitle>
            <CardDescription>Crie e edite as turmas da instituição.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <School className="mr-2 h-4 w-4" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingClass ? 'Editar Turma' : 'Cadastrar Nova Turma'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Turma *</Label>
                  <Input id="name" {...register("name")} placeholder="Ex: Turma A - Matutino" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => handleDialogChange(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createClass.isPending || updateClass.isPending}>
                    {createClass.isPending || updateClass.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" /> Salvar</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {classes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Turma</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(cls)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. A exclusão de uma turma não remove os alunos, mas eles ficarão sem turma definida.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteClass.mutate(cls.id)} disabled={deleteClass.isPending}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <FileX2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma turma encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">Comece cadastrando uma nova turma para vê-la aqui.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}