import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  UserCog,
  GraduationCap,
  Home,
  Heart,
  Code,
  School,
  Menu,
  LogOut,
  Bell,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  HeartPulse,
  BrainCircuit,
  MessageSquare,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout() {
  const { signOut, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getAvatarContent = (name?: string, role?: string) => {
    if (role === "gestor") return <Code className="h-4 w-4" />;
    if (!name) return "U";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "gestor":     return "from-violet-600 to-indigo-600";
      case "cuidador":   return "from-emerald-500 to-teal-500";
      case "responsavel":return "from-orange-500 to-amber-500";
      default:           return "from-slate-600 to-slate-700";
    }
  };

  const getRoleName = (role?: string) => {
    switch (role) {
      case "gestor":      return "Administrador";
      case "cuidador":    return "Cuidador";
      case "responsavel": return "Responsável";
      default:            return "Usuário";
    }
  };

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case "gestor":      return "bg-violet-500/15 text-violet-700 dark:text-violet-400 ring-1 ring-violet-500/30";
      case "cuidador":    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30";
      case "responsavel": return "bg-orange-500/15 text-orange-700 dark:text-orange-400 ring-1 ring-orange-500/30";
      default:            return "bg-slate-500/15 text-slate-700 dark:text-slate-400";
    }
  };

  const navItems = [
    { to: "/",          icon: Home,          label: "Dashboard" },
    { to: "/students",  icon: GraduationCap, label: "Alunos" },
    { to: "/users",     icon: Users,         label: "Usuários" },
    { to: "/classes",   icon: School,        label: "Turmas" },
    { to: "/communication", icon: MessageSquare, label: "Comunicação" },
    { to: "/health",    icon: HeartPulse,    label: "Diário de Saúde" },
    { to: "/pdi",       icon: BrainCircuit,  label: "PDI & Evolução" },
    { to: "/security",  icon: ShieldCheck,   label: "Segurança" },
    { to: "/settings",  icon: UserCog,       label: "Configurações" },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-border/60">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow-sm">
          <Heart className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">Gestão</p>
          <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 leading-tight tracking-wide">ATÍPICOS</p>
        </div>
        <div className="ml-auto">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
        </div>
      </div>

      {/* Profile card in sidebar */}
      <div className="mx-3 mt-4 p-3 rounded-xl bg-muted/50 border border-border/60">
        {authLoading || profileLoading ? (
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-14" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 ring-2 ring-background">
              <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
              <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(profile?.role)} text-white text-xs font-semibold`}>
                {getAvatarContent(profile?.name, profile?.role)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{profile?.name}</p>
              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${getRoleBadgeClass(profile?.role)}`}>
                {getRoleName(profile?.role)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">Menu</p>
        {navItems.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 animate-slide-in-left delay-${i * 75 + 75} ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`
            }
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-border/60 pt-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col pt-[env(safe-area-inset-top)] min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 px-4 lg:px-6 bg-background/80 backdrop-blur-xl border-b border-border/60">
          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 md:hidden rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border pt-[env(safe-area-inset-top)]">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          {/* Page title area */}
          <div className="flex-1">
            <div className="hidden md:block">
              <div className="h-6 w-px bg-border inline-block mr-3 align-middle" />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ModeToggle />

            {/* Notification bell */}
            <Button variant="ghost" size="icon" className="relative rounded-xl h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-xl h-9 px-2 hover:bg-accent/10">
                  {authLoading || profileLoading ? (
                    <Skeleton className="h-7 w-7 rounded-full" />
                  ) : (
                    <>
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
                        <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(profile?.role)} text-white text-[10px] font-bold`}>
                          {getAvatarContent(profile?.name, profile?.role)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:block text-left">
                        <p className="text-xs font-semibold leading-none">{profile?.name?.split(' ')[0]}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{getRoleName(profile?.role)}</p>
                      </div>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>
                  <p className="font-semibold">{profile?.name}</p>
                  <p className="text-xs text-muted-foreground font-normal">{getRoleName(profile?.role)}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 rounded-lg cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6 bg-mesh pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
