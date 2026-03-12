import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Auth from '../pages/Auth';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

// 1. Mock do hook useAuth
// Precisamos que o mock seja flexível para alterar o 'user' entre testes
const useAuthMock = vi.fn();
const signInMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
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
    // Configura o comportamento padrão: usuário deslogado
    useAuthMock.mockReturnValue({
      user: null,
      signIn: signInMock,
    });
    signInMock.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve corresponder ao snapshot da UI', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
    expect(asFragment()).toMatchSnapshot();
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

  it('deve tratar erros inesperados no login (catch block)', async () => {
    const user = userEvent.setup();
    // Simula um erro genérico de rede ou javascript
    signInMock.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/Email/i), 'teste@exemplo.com');
    await user.type(screen.getByLabelText(/Senha/i), 'senha123');
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    expect(toast.error).toHaveBeenCalledWith(
      "Erro inesperado",
      expect.any(Object)
    );
  });

  it('deve redirecionar (não renderizar o form) se o usuário já estiver logado', () => {
    // Simula usuário logado
    useAuthMock.mockReturnValue({
      user: { id: '123', email: 'user@test.com' },
      signIn: signInMock,
    });

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    // Se redirecionou, o input de email não deve estar na tela
    expect(screen.queryByLabelText(/Email/i)).not.toBeInTheDocument();
  });

  it('deve baixar o APK ao clicar em instalar no Android', async () => {
    const user = userEvent.setup();
    
    // Mock do User Agent para Android
    const originalUserAgent = window.navigator.userAgent;
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 10; Mobile)',
      configurable: true
    });

    // Spies para monitorar o DOM sem quebrar a renderização do React
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');
    // Mock do click para evitar erros de navegação no JSDOM
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const installButton = screen.getByRole('button', { name: /Instalar App/i });
    await user.click(installButton);

    // Verifica se um elemento <a> com o download correto foi adicionado ao body
    const downloadLink = appendSpy.mock.calls.find(call => 
      call[0] instanceof HTMLAnchorElement && 
      call[0].getAttribute('download') === 'GestaoAtipicos.apk'
    )?.[0] as HTMLAnchorElement;

    expect(downloadLink).toBeDefined();
    expect(downloadLink.getAttribute('href')).toBe('/GestaoAtipicos.apk');

    // Verifica se ele foi clicado e removido
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith(downloadLink);

    // Restaurar User Agent
    Object.defineProperty(window.navigator, 'userAgent', { value: originalUserAgent, configurable: true });
  });

  it('deve mostrar instrução de instalação no iOS', async () => {
    const user = userEvent.setup();
    
    // Mock do User Agent para iOS
    const originalUserAgent = window.navigator.userAgent;
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X)',
      configurable: true
    });

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const installButton = screen.getByRole('button', { name: /Instalar App/i });
    await user.click(installButton);

    expect(toast.info).toHaveBeenCalledWith(
      'Instalar no iPhone/iPad',
      expect.any(Object)
    );

    Object.defineProperty(window.navigator, 'userAgent', { value: originalUserAgent, configurable: true });
  });

  it('deve usar o prompt de instalação PWA se disponível (Desktop/Mobile)', async () => {
    const user = userEvent.setup();
    const promptMock = vi.fn();
    
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    // 1. Simula o evento do navegador dizendo que o PWA pode ser instalado
    const event = new Event('beforeinstallprompt') as any;
    event.prompt = promptMock;
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    event.preventDefault = vi.fn();
    
    // Dispara o evento na janela
    act(() => {
      window.dispatchEvent(event);
    });

    // 2. Clica no botão de instalar
    const installButton = screen.getByRole('button', { name: /Instalar App/i });
    await user.click(installButton);

    // 3. Verifica se o prompt nativo foi chamado
    expect(promptMock).toHaveBeenCalled();
  });

  it('deve baixar o APK como fallback em Desktop/Outros (sem PWA prompt)', async () => {
    const user = userEvent.setup();
    // O JSDOM padrão já tem um UserAgent que não é Android nem iOS, caindo no 'Desktop'
    
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const installButton = screen.getByRole('button', { name: /Instalar App/i });
    await user.click(installButton);

    // Verifica se o toast informativo apareceu
    expect(toast.info).toHaveBeenCalledWith('Iniciando Download', expect.any(Object));

    // Verifica se o link de download foi criado e clicado
    const downloadLink = appendSpy.mock.calls.find(call => 
      call[0] instanceof HTMLAnchorElement && 
      call[0].getAttribute('download') === 'GestaoAtipicos.apk'
    )?.[0] as HTMLAnchorElement;

    expect(downloadLink).toBeDefined();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith(downloadLink);
  });
});