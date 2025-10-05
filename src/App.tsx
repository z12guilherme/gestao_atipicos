import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Importe a nova página de estudantes
import { StudentsPage } from "./pages/StudentsPage";
import { UsersPage } from "./pages/UsersPage";
import { ClassManagement } from "./components/gestor/ClassManagement";
import { CaregiverManagement } from "./components/gestor/CaregiverManagement";
import { GuardianManagement } from "./components/gestor/GuardianManagement";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />

              {/* Rotas Protegidas */}
              <Route
                element={<ProtectedRoute><Layout /></ProtectedRoute>}
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/classes" element={<ClassManagement />} />
                <Route path="/caregivers" element={<CaregiverManagement />} />
                <Route path="/guardians" element={<GuardianManagement />} />
                <Route path="/settings" element={<Settings />} />
                {/* Adicione outras rotas que devem usar o Layout aqui */}
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;