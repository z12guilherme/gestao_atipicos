import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const passwordSchema = z.object({
  password: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres.'),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    // O Supabase adiciona o token de acesso ao URL como um fragmento hash.
    // Esta função é acionada quando o estado de autenticação muda (após o login via link mágico).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // O usuário está autenticado e pronto para definir uma nova senha.
        // Não precisamos fazer nada aqui, apenas permitir que o formulário seja usado.
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (data: PasswordFormData) => {
    setIsUpdating(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: data.password });
      if (updateError) throw updateError;

      toast.success('Senha atualizada com sucesso!');
      navigate('/'); // Redireciona para o dashboard após a atualização
    } catch (err: any) {
      setError(err.message);
      toast.error('Falha ao atualizar a senha', { description: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir sua Senha</CardTitle>
          <CardDescription>Digite sua nova senha abaixo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Nova Senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}