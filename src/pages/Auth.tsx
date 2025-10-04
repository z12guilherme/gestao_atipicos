import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff, Heart, Users, GraduationCap, Star, Loader2 } from "lucide-react";

export default function Auth() {
  const { user, signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (error) {
        toast.error("Erro no login", {
          description: "Email ou senha inválidos. Por favor, verifique suas credenciais.",
        });
      } else {
        toast.success("Login realizado com sucesso!", {
          description: "Redirecionando para o painel...",
        });
      }
    } catch (error) {
      toast.error("Erro inesperado", {
        description: "Ocorreu uma falha. Tente novamente em alguns instantes.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
          {/* Left side - Branding and Features */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Gestão Atípicos
                  </h1>
                  <p className="text-muted-foreground">Sistema de cuidado especializado</p>
                </div>
              </div>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Plataforma completa para gestão e acompanhamento de estudantes atípicos, 
                conectando cuidadores, famílias e gestores em um ambiente colaborativo.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Acompanhamento Individual</h3>
                  <p className="text-sm text-muted-foreground">
                    Registro detalhado do progresso e necessidades de cada estudante
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Equipe Colaborativa</h3>
                  <p className="text-sm text-muted-foreground">
                    Comunicação eficiente entre cuidadores, famílias e gestores
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Cuidado Especializado</h3>
                  <p className="text-sm text-muted-foreground">
                    Ferramentas especializadas para atendimento de qualidade
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <p className="text-sm text-blue-700 italic">
                "Um sistema feito com carinho para quem dedica sua vida ao cuidado de pessoas especiais."
              </p>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="shadow-xl border-t-4 border-blue-600">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="flex justify-center lg:hidden mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                    <Heart className="h-8 w-8" />
                  </div>
                </div>
                <div className="lg:hidden space-y-2">
                  <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Gestão Atípicos
                  </CardTitle>
                  <CardDescription className="text-base">
                    Sistema de cuidado especializado
                  </CardDescription>
                </div>
                <div className="hidden lg:block space-y-2">
                  <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
                  <CardDescription className="text-base">Acesse sua conta para continuar</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        className="h-11 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Entrando...</span>
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
                <CardFooter className="text-xs text-muted-foreground pt-6 justify-center">
                  <p>
                    Todos os Direitos Reservados &copy; {new Date().getFullYear()} | Dev: Marcos Guilherme
                  </p>
                </CardFooter>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 py-4">
      </footer>
    </div>
  );
}