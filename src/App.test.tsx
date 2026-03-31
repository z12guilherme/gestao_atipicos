import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';

// Mock dos hooks e componentes para isolar o teste no roteamento
const useAuthMock = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

// Mock dos dashboards para simplificar o teste e torná-lo mais rápido
vi.mock('@/pages/GestorDashboard', () => ({
  GestorDashboard: () => <div data-testid="gestor-dashboard">Gestor Dashboard</div>,
}));
vi.mock('@/pages/CuidadorDashboard', () => ({
  CuidadorDashboard: () => <div data-testid="cuidador-dashboard">Cuidador Dashboard</div>,
}));
vi.mock('@/pages/ResponsavelDashboard', () => ({
  ResponsavelDashboard: () => <div data-testid="responsavel-dashboard">Responsavel Dashboard</div>,
}));

describe('Roteamento Principal e Renderização de Dashboards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve redirecionar para /auth se o usuário não estiver logado', () => {
    useAuthMock.mockReturnValue({ user: null, profile: null, loading: false });
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </MemoryRouter>
    );

    // O componente Index redireciona, então o Auth deve ser renderizado.
    // Verificamos por um elemento específico da página de Auth.
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('deve renderizar o GestorDashboard para o perfil "gestor"', () => {
    useAuthMock.mockReturnValue({
      user: { id: 'user-1' },
      profile: { id: 'profile-1', role: 'gestor' },
      loading: false,
    });

    render(<MemoryRouter initialEntries={['/']}><Index /></MemoryRouter>);
    expect(screen.getByTestId('gestor-dashboard')).toBeInTheDocument();
  });

  it('deve renderizar o CuidadorDashboard para o perfil "cuidador"', () => {
    useAuthMock.mockReturnValue({
      user: { id: 'user-2' },
      profile: { id: 'profile-2', role: 'cuidador' },
      loading: false,
    });

    render(<MemoryRouter initialEntries={['/']}><Index /></MemoryRouter>);
    expect(screen.getByTestId('cuidador-dashboard')).toBeInTheDocument();
  });

  it('deve renderizar o ResponsavelDashboard para o perfil "responsavel"', () => {
    useAuthMock.mockReturnValue({
      user: { id: 'user-3' },
      profile: { id: 'profile-3', role: 'responsavel' },
      loading: false,
    });

    render(<MemoryRouter initialEntries={['/']}><Index /></MemoryRouter>);
    expect(screen.getByTestId('responsavel-dashboard')).toBeInTheDocument();
  });

  it('deve exibir o estado de carregamento', () => {
    useAuthMock.mockReturnValue({ user: null, profile: null, loading: true });
    render(<MemoryRouter initialEntries={['/']}><Index /></MemoryRouter>);
    expect(screen.getByText(/Carregando.../i)).toBeInTheDocument();
  });
});