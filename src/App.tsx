import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { DownloadAppBanner } from "@/components/ui/DownloadAppBanner";

import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Importe a nova página de estudantes
import { StudentsPage } from "./pages/StudentsPage";
import { UsersPage } from "./pages/UsersPage";
import { ClassManagement } from "./components/gestor/ClassManagement";
import Settings from "./pages/Settings";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import TutorialPage from "./pages/TutorialPage";
import { SecurityPage } from "./pages/SecurityPage";
import { HealthPage } from "./pages/HealthPage";
import { PdiDashboard } from "./pages/PdiDashboard";
import { CommunicationPage } from "./pages/CommunicationPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/update-password" element={<UpdatePasswordPage />} />
                <Route path="/tutorial" element={<TutorialPage />} />

                {/* Rotas Protegidas */}
                <Route
                  element={<ProtectedRoute><Layout /></ProtectedRoute>}
                >
                  {/* Rotas mais específicas primeiro */}
                  <Route path="/students" element={<StudentsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/classes" element={<ClassManagement />} />
                  <Route path="/communication" element={<CommunicationPage />} />
                  <Route path="/health" element={<HealthPage />} />
                  <Route path="/pdi" element={<PdiDashboard />} />
                  <Route path="/security" element={<SecurityPage />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* Rota raiz (genérica) por último */}
                  <Route path="/" element={<Dashboard />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              <DownloadAppBanner />
              <Toaster />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;