import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Smartphone, X } from 'lucide-react';
import { toast } from 'sonner';

type OperatingSystem = 'iOS' | 'Android' | 'Desktop' | 'unknown';

const getOperatingSystem = (): OperatingSystem => {
  // Garante que o código só rode no navegador
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const userAgent = window.navigator.userAgent;

  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'iOS';
  }

  return 'Desktop';
};

export const DownloadAppBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const detectedOs = getOperatingSystem();
    // Mostra o banner apenas em dispositivos móveis após um pequeno delay
    let timer: any;
    if (detectedOs === 'Android' || detectedOs === 'iOS') {
      timer = setTimeout(() => setIsVisible(true), 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Não mostra o banner na página de login para evitar sobreposição com o botão fixo
  if (location.pathname === '/auth') {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    } else {
      const os = getOperatingSystem();
      if (os === 'iOS') {
        toast.info('Instalar no iPhone/iPad', {
          description: 'Toque no botão Compartilhar e selecione "Adicionar à Tela de Início".',
          duration: 5000,
        });
      } else {
        toast.info('Instalação Manual Necessária', {
          description: 'O navegador bloqueou a instalação automática. Abra o menu do navegador e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".',
          duration: 5000,
        });
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <Card 
        className="shadow-2xl animate-in slide-in-from-bottom-10 duration-500 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={handleInstallClick}
      >
        <CardHeader className="flex-row items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm font-medium">Instale o app para acesso rápido!</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={(e) => {
                e.stopPropagation(); 
                setIsVisible(false);
              }}
            >
                <X className="h-4 w-4" />
            </Button>
        </CardHeader>
      </Card>
    </div>
  );
};