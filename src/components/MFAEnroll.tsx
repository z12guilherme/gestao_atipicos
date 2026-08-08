import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldAlert, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';

export function MFAEnroll() {
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      
      if (data.currentLevel === 'aal2' || data.nextLevel === 'aal2') {
        // Já tem MFA
        setIsEnrolled(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEnrollment = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.uri);
      setSecret(data.totp.secret);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao iniciar MFA: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyEnrollment = async () => {
    setLoading(true);
    setError('');
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode
      });
      if (verify.error) throw verify.error;

      setIsEnrolled(true);
      toast.success('Autenticação de 2 Fatores (Google Auth) ativada com sucesso!');
    } catch (err: any) {
      setError('Código inválido. Tente novamente.');
      toast.error('Erro na verificação. O código está correto?');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Segredo copiado para a área de transferência');
  };

  if (loading && !qrCode && !isEnrolled) {
    return <div className="text-sm text-muted-foreground">Carregando status de segurança...</div>;
  }

  if (isEnrolled) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm rounded-2xl">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Google Authenticator Ativado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sua conta está super protegida com a autenticação de 2 fatores.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-500" />
          Autenticação de 2 Fatores (2FA)
        </CardTitle>
        <CardDescription>
          Aumente a segurança da sua conta usando o Google Authenticator ou Authy.
        </CardDescription>
      </CardHeader>
      
      {!qrCode ? (
        <CardContent>
          <Button onClick={startEnrollment} disabled={loading} className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700">
            Configurar Google Authenticator
          </Button>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </CardContent>
      ) : (
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-muted/30 p-4 rounded-xl border border-border/50">
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <QRCodeSVG value={qrCode} size={150} level="M" />
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <h4 className="font-medium text-sm">1. Escaneie o QR Code</h4>
                <p className="text-xs text-muted-foreground">Abra o app Google Authenticator no seu celular e escaneie este código.</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Ou digite o código manualmente:</h4>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted p-1.5 rounded text-indigo-600 font-bold">{secret}</code>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copySecret}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">2. Digite o código gerado pelo App</h4>
            <div className="flex gap-3">
              <Input 
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-32 text-center text-lg tracking-widest font-mono"
              />
              <Button onClick={verifyEnrollment} disabled={loading || verifyCode.length < 6} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Verificar e Ativar
              </Button>
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
