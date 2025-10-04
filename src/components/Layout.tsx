import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Users,
  UserCheck,
  UserCog,
  LogOut,
  GraduationCap,
  Home,
  Bell,
  Heart,
  Code,
  School,
  Search,
  HeartHandshake,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Função atualizada para mostrar o ícone de código para o gestor
  const getAvatarContent = (name?: string, role?: string) => {
    if (role === "gestor") {
      return <Code className="h-5 w-5" />;
    }
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "gestor":
        return "bg-gradient-to-r from-purple-600 to-blue-600";
      case "cuidador":
        return "bg-gradient-to-r from-green-600 to-teal-600";
      case "responsavel":
        return "bg-gradient-to-r from-orange-600 to-red-600";
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-800";
    }
  };

  // Função atualizada para mostrar "Administrador"
  const getRoleName = (role?: string) => {
    switch (role) {
      case "gestor":
        return "Administrador";
      case "cuidador":
        return "Cuidador";
      case "responsavel":
        return "Responsável";
      default:
        return "Usuário";
    }
  };

  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/students", icon: GraduationCap, label: "Alunos" },
    { to: "/users", icon: Users, label: "Usuários" },
    { to: "/classes", icon: School, label: "Turmas" },
    { to: "/caregivers", icon: HeartHandshake, label: "Cuidadores" },
    { to: "/guardians", icon: UserCheck, label: "Responsáveis" },
    { to: "/settings", icon: UserCog, label: "Configurações" },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <NavLink to="/" className="flex items-center gap-2 font-semibold">
              <Heart className="h-6 w-6 text-blue-600" />
              <span className="">Gestão Atípicos</span>
            </NavLink>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      isActive ? "bg-muted text-primary" : "text-muted-foreground"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile menu can be added here later */}
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar alunos, usuários..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className={`text-white font-semibold ${getRoleColor(profile?.role)}`}>
                  {getAvatarContent(profile?.name, profile?.role)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  {profile?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getRoleName(profile?.role)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-slate-50 dark:bg-slate-900">
          <Outlet /> {/* react-router-dom will render nested routes here */}
        </main>
      </div>
    </div>
  );
}