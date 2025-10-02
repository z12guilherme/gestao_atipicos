import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  UserCheck, 
  UserCog, 
  LogOut, 
  GraduationCap,
  Menu,
  Home,
  Bell,
  Heart
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      roles: ['gestor', 'cuidador', 'responsavel'],
      description: "Visão geral do sistema"
    },
    {
      name: "Estudantes",
      href: "/students",
      icon: GraduationCap,
      roles: ['gestor', 'cuidador'],
      description: "Gerenciar alunos"
    },
    {
      name: "Cuidadores",
      href: "/caregivers",
      icon: UserCheck,
      roles: ['gestor'],
      description: "Equipe de cuidadores"
    },
    {
      name: "Responsáveis",
      href: "/guardians",
      icon: UserCog,
      roles: ['gestor'],
      description: "Pais e tutores"
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'gestor': return 'bg-gradient-to-r from-purple-600 to-blue-600';
      case 'cuidador': return 'bg-gradient-to-r from-green-600 to-teal-600';
      case 'responsavel': return 'bg-gradient-to-r from-orange-600 to-red-600';
      default: return 'bg-gradient-to-r from-gray-600 to-gray-800';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'gestor': return 'Gestor';
      case 'cuidador': return 'Cuidador';
      case 'responsavel': return 'Responsável';
      default: return 'Usuário';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                <Heart className="h-5 w-5" />
              </div>
              <div className="hidden font-bold sm:inline-block">
                <span className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Gestão Atípicos
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <nav className="hidden md:flex items-center space-x-1">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 shadow-md dark:bg-blue-900/50 dark:text-blue-300'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                      }`}
                      title={item.description}
                    >
                      <Icon className={`h-4 w-4 mr-2 transition-colors ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9 border-2 border-white shadow-lg">
                  <AvatarFallback className={`text-white font-semibold ${getRoleColor(profile?.role)}`}>
                    {getUserInitials(profile?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <div className="text-sm font-medium leading-none">{profile?.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getRoleLabel(profile?.role)}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:ml-2">Sair</span>
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t bg-white/95 backdrop-blur-md md:hidden dark:bg-slate-900/95">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-3" />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}