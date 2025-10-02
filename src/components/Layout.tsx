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

          {/* User Menu */}
          <div className="flex flex-1 items-center justify-end space-x-3">
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