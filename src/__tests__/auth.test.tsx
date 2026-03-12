import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Auth from '../pages/Auth';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

// 1. Mock do hook useAuth
// Interceptamos o hook para não chamar o Supabase de verdade
const signInMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null, // Simula usuário deslogado
    signIn: signInMock,
  }),
}));

// 2. Mock do Sonner (Toast) e outros componentes que podem dar erro no jsdom
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock do ThemeToggle se necessário (evita erros de importação se o caminho for complexo)
vi.mock('../pages/theme-toggle-button', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Toggle</div>,
}));

describe('Fluxo de Autenticação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Configura o mock para retornar sucesso por padrão
    signInMock.mockResolvedValue({ error: null });
  });

  it('deve permitir que o usuário digite credenciais e clique em entrar', async () => {
    const user = userEvent.setup();

    // Renderizamos dentro do BrowserRouter pois o Auth usa <Link> e hooks de rota
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    // Buscamos os elementos reais da sua página Auth.tsx
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Senha/i);
    // O botão pode ter texto "Entrar" ou estar carregando, buscamos pelo tipo submit
    const loginButton = screen.getByRole('button', { name: /Entrar/i });

    // Simulamos a interação
    await user.type(emailInput, 'teste@exemplo.com');
    await user.type(passwordInput, 'senha123');
    await user.click(loginButton);

    // Verificamos se a função de login foi chamada com os parâmetros certos
    expect(signInMock).toHaveBeenCalledTimes(1);
    expect(signInMock).toHaveBeenCalledWith('teste@exemplo.com', 'senha123');
  });

  it('deve exibir mensagem de erro quando as credenciais são inválidas', async () => {
    const user = userEvent.setup();
    
    // Forçamos o mock a retornar um erro apenas para este teste
    signInMock.mockResolvedValueOnce({ 
      error: { message: 'Invalid login credentials' } 
    });

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/Email/i), 'errado@exemplo.com');
    await user.type(screen.getByLabelText(/Senha/i), 'senhaerrada');
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    // Verificamos se o toast.error foi chamado com a mensagem amigável
    expect(toast.error).toHaveBeenCalledWith(
      "Erro no login",
      expect.objectContaining({
        description: "Email ou senha inválidos."
      })
    );
  });
});