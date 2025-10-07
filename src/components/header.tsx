import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../../theme-toggle";
import { useProfile } from "@/components/gestor/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSeparator,
  DropdownMenuTrigger, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

export function Header() {
  const location = useLocation();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Define os links de navegação com base no perfil do usuário
  const navLinks = {
    gestor: [
      { href: "/gestor", label: "Dashboard" },
      { href: "/gestor/users", label: "Usuários" },
      { href: "/gestor/students", label: "Alunos" },
      { href: "/gestor/classes", label: "Turmas" },
      { href: "/gestor/assignments", label: "Vínculos" },
    ],
    responsavel: [{ href: "/responsavel", label: "Meus Filhos" }],
    cuidador: [{ href: "/cuidador", label: "Meus Alunos" }],
    professor: [{ href: "/professor", label: "Minhas Turmas" }],
  };

  const links = navLinks[profile?.role as keyof typeof navLinks] || [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <nav className="flex items-center space-x-4 lg:space-x-6 mr-6">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Gestão Atípicos</span>
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
                <AvatarFallback>{profile?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>Tema</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <ThemeToggle />
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}