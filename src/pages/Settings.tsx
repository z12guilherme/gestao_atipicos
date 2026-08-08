import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Users, Mail } from 'lucide-react';
import { AvatarUpload } from '@/components/shared/AvatarUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/gestor/UserManagement';
import { SiemDashboard } from '@/components/gestor/SiemDashboard';
import { User } from '@/hooks/useUsers';
import { MFAEnroll } from '@/components/MFAEnroll';

const profileSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  avatar_url: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { profile, updateProfile, isLoading: isProfileLoading } = useProfile();
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  // Estado para controlar os modais do UserManagement
  const [isUserDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { register, handleSubmit, setValue, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || '',
      avatar_url: profile?.avatar_url || '',
    },
    // Re-enable form when profile data loads
    disabled: isProfileLoading,
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast.error("Não foi possível encontrar o seu e-mail.");
      return;
    }
    setIsSendingResetEmail(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      toast.success("E-mail de redefinição de senha enviado!", {
        description: "Por favor, verifique sua caixa de entrada e siga as instruções.",
      });
    } catch (error: any) {
      toast.error("Falha ao enviar e-mail", { description: error.message });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  if (isProfileLoading) {
    return <div>Carregando perfil...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua conta.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          {profile?.role === 'gestor' && <TabsTrigger value="users">Usuários</TabsTrigger>}
          {profile?.role === 'gestor' && <TabsTrigger value="siem">Monitoramento (SIEM)</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Perfil Público</CardTitle>
              <CardDescription>Atualize seu nome e foto de perfil.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label>Foto de Perfil</Label>
                  <AvatarUpload
                    url={profile?.avatar_url}
                    onUpload={(url) => {
                      setValue('avatar_url', url, { shouldDirty: true });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome de Exibição</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={updateProfile.isPending || !isDirty}>
                    {updateProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>Gerencie a segurança da sua conta, como a redefinição de senha.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Redefinir Senha</h3>
                <p className="text-sm text-muted-foreground">
                  Um link para redefinir sua senha será enviado para o seu e-mail cadastrado ({user?.email}).
                </p>
              </div>
              <Button onClick={handlePasswordReset} disabled={isSendingResetEmail}>
                {isSendingResetEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Enviar E-mail de Redefinição
              </Button>
            </CardContent>
          </Card>

          <MFAEnroll />
        </TabsContent>

        {profile?.role === 'gestor' && (
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento Completo de Usuários</CardTitle>
                <CardDescription>Adicione, edite, remova e gerencie as senhas dos usuários do sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* O componente de gerenciamento de usuários é renderizado aqui */}
                <UserManagement isDialogOpen={isUserDialogOpen} setDialogOpen={setUserDialogOpen} editingUser={editingUser} setEditingUser={setEditingUser} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {profile?.role === 'gestor' && (
          <TabsContent value="siem">
             <SiemDashboard />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}