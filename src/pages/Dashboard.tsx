import { Navigate } from "react-router-dom";
import { GestorDashboard } from "@/pages/GestorDashboard";
import { CuidadorDashboard } from "@/pages/CuidadorDashboard";
import { ResponsavelDashboard } from "@/pages/ResponsavelDashboard";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const loading = authLoading || profileLoading;
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Dashboard content based on user role
  const getDashboardContent = () => {
    if (!profile) return null;

    switch (profile.role) {
      case 'gestor':
        return <GestorDashboard />;
        
      case 'cuidador':
        return <CuidadorDashboard />;
        
      case 'responsavel':
        return <ResponsavelDashboard />;
        
      default:
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-muted-foreground mb-2">
                Perfil não reconhecido
              </h2>
              <p className="text-muted-foreground">
                Entre em contato com o administrador do sistema
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    getDashboardContent()
  );
};

export default Dashboard;
