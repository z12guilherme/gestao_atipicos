import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Eye, EyeOff, Heart, Users, GraduationCap, ShieldCheck,
  Loader2, Download, ArrowRight, Sparkles, Lock, Mail,
} from "lucide-react";
import { ThemeToggle as OriginalThemeToggle } from "./theme-toggle-button";

type OperatingSystem = 'iOS' | 'Android' | 'Desktop' | 'unknown';

const getOperatingSystem = (): OperatingSystem => {
  if (typeof window === 'undefined') return 'unknown';
  const ua = window.navigator.userAgent;
  if (/android/i.test(ua)) return 'Android';
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'iOS';
  return 'Desktop';
};

const features = [
  {
    icon: GraduationCap,
    color: "from-indigo-500 to-violet-600",
    bg: "bg-indigo-500/10 ring-1 ring-indigo-500/20",
    title: "Acompanhamento Individual",
    desc: "Registro detalhado do progresso e necessidades de cada estudante atípico.",
  },
  {
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10 ring-1 ring-emerald-500/20",
    title: "Equipe Colaborativa",
    desc: "Comunicação fluida entre cuidadores, famílias e gestores.",
  },
  {
    icon: ShieldCheck,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10 ring-1 ring-amber-500/20",
    title: "Segurança & LGPD",
    desc: "Dados protegidos com criptografia e conformidade total com a LGPD.",
  },
];

export default function Auth() {
  const { user, signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    (document.activeElement as HTMLElement)?.blur();
    setLoading(true);
    try {
      const { error } = await signIn(loginForm.email.trim().toLowerCase(), loginForm.password);
      if (error) {
        const isApiKeyError = error.message?.includes("Invalid API key");
        toast.error("Erro no login", {
          description: isApiKeyError
            ? "Erro de Configuração: A API Key no .env está incorreta."
            : error.message === "Invalid login credentials"
            ? "Email ou senha inválidos."
            : error.message || "Verifique suas credenciais.",
        });
      } else {
        toast.success("Login realizado com sucesso!", { description: "Redirecionando para o painel..." });
      }
    } catch {
      toast.error("Erro inesperado", { description: "Ocorreu uma falha. Tente novamente." });
    }
    setLoading(false);
  };

  const handleInstallClick = async () => {
    const os = getOperatingSystem();
    if (os === 'Android') {
      const link = document.createElement('a');
      link.href = '/GestaoAtipicos.apk';
      link.setAttribute('download', 'GestaoAtipicos.apk');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      if (os === 'iOS') {
        toast.info('Instalar no iPhone/iPad', {
          description: 'Toque no botão Compartilhar e selecione "Adicionar à Tela de Início".',
          duration: 5000,
        });
      } else {
        const link = document.createElement('a');
        link.href = '/GestaoAtipicos.apk';
        link.setAttribute('download', 'GestaoAtipicos.apk');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.info('Iniciando Download', { description: 'Baixando o aplicativo Android...' });
      }
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-mesh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">

      {/* ── Animated mesh background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/20 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/15 blur-[100px] animate-float delay-500" />
        <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-teal-500/10 blur-[80px] animate-float delay-300" />
        {/* Grid dots pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(hsl(220 100% 80%) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <OriginalThemeToggle />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10 lg:py-0 min-h-[100dvh] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full max-w-6xl mx-auto">

          {/* ── Left side — Branding ── */}
          <div className={`hidden lg:flex flex-col gap-10 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-emerald-500">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground dark:text-white leading-tight">Gestão Atípicos</h1>
                <p className="text-indigo-700 dark:text-indigo-300 text-sm mt-0.5">Sistema de cuidado especializado</p>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-5xl font-bold text-foreground dark:text-white leading-tight">
                Cuidado e gestão{" "}
                <span className="text-gradient">inteligentes</span>{" "}
                para quem mais importa.
              </h2>
              <p className="text-lg text-muted-foreground dark:text-slate-400 leading-relaxed max-w-md">
                Plataforma completa que conecta cuidadores, famílias e gestores em um ambiente colaborativo, seguro e acolhedor.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className={`flex items-start gap-4 p-4 rounded-2xl bg-card/70 border border-border/70 shadow-sm dark:bg-white/5 dark:border-white/8 dark:shadow-none dark:hover:bg-white/8 transition-colors animate-slide-up delay-${i * 150 + 100}`}
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${f.bg}`}>
                    <f.icon className="h-5 w-5 text-primary dark:text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground dark:text-white">{f.title}</p>
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="p-5 rounded-2xl border border-indigo-500/25 bg-indigo-500/10 dark:bg-indigo-500/8">
              <p className="text-sm text-indigo-800 dark:text-indigo-200 italic leading-relaxed">
                "Um sistema feito com carinho para quem dedica sua vida ao cuidado de pessoas especiais."
              </p>
            </div>
          </div>

          {/* ── Right side — Login form ── */}
          <div className={`w-full max-w-md mx-auto ${mounted ? 'animate-scale-in delay-100' : 'opacity-0'}`}>
            <div className="glass-card rounded-3xl p-8">
              {/* Mobile logo */}
              <div className="flex justify-center mb-8 lg:hidden">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow animate-pulse-glow">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h1 className="text-xl font-bold text-gradient">Gestão Atípicos</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Sistema de cuidado especializado</p>
                  </div>
                </div>
              </div>

              {/* Form header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta!</h2>
                <p className="text-sm text-muted-foreground mt-1.5">Acesse sua conta para continuar</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="h-12 pl-10 rounded-xl border-border/60 bg-background/60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="h-12 pl-10 pr-12 rounded-xl border-border/60 bg-background/60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-glow-sm hover:shadow-glow transition-all duration-300 group"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar na Plataforma
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Links */}
              <div className="mt-6 text-center space-y-3">
                <Link
                  to="/tutorial"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                >
                  Saiba mais sobre segurança e LGPD
                </Link>
                <div className="lg:hidden">
                  <a
                    href="/GestaoAtipicos.apk"
                    download="GestaoAtipicos.apk"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Baixar APK para Android
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-5 border-t border-border/40 text-center">
                <p className="text-[11px] text-muted-foreground">
                  © {new Date().getFullYear()} Gestão Atípicos · Dev: Marcos Guilherme
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Install button */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
        <Button
          className="shadow-glow-sm rounded-full gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border-0 animate-slide-in-from-bottom-4 text-white px-6"
          onClick={handleInstallClick}
        >
          <Download className="h-4 w-4" />
          Instalar App
        </Button>
      </div>
    </div>
  );
}
