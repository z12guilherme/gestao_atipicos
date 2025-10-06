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
import { AssignmentManagement } from "@/components/gestor/AssignmentManagement";
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
                {/* Rotas mais específicas primeiro */}
                <Route path="/gestor/assignments" element={<AssignmentManagement />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/classes" element={<ClassManagement />} />
                <Route path="/settings" element={<Settings />} />
                {/* Rota raiz (genérica) por último */}
                <Route path="/" element={<Dashboard />} />
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