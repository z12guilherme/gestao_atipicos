import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NewNoteDialog } from '@/pages/NewNoteDialog';
import { Student } from '@/hooks/useCaregiverData';

// 1. Mock do hook useProfile para simular um cuidador logado
vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    profile: { id: 'cuidador-123', name: 'Cuidador Teste' },
  }),
}));

// 2. Mock do React Query (useMutation e useQueryClient)
// Criamos mocks flexíveis para poder verificar chamadas e simular loading
const mutateMock = vi.fn();
const useMutationMock = vi.fn();

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
    useMutation: (options: any) => useMutationMock(options),
  };
});

// 3. Mock do Sonner (Toast)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Dados falsos de estudantes para o teste
const mockStudents: Student[] = [
  { 
    id: 'estudante-1', 
    name: 'João Silva', 
    birth_date: '2015-01-01', 
    status: 'ativo',
    class_name: '1A', 
    period: 'Manhã',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 'estudante-2', 
    name: 'Maria Oliveira', 
    birth_date: '2016-05-10', 
    status: 'ativo',
    class_name: '2B', 
    period: 'Tarde',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];

describe('NewNoteDialog Component', () => {
  const onOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Configuração padrão do mock da mutation (estado idle)
    useMutationMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    });
  });

  it('deve renderizar corretamente quando aberto', () => {
    render(
      <NewNoteDialog 
        isOpen={true} 
        onOpenChange={onOpenChange} 
        students={mockStudents} 
      />
    );

    expect(screen.getByText('Nova Observação')).toBeInTheDocument();
    expect(screen.getByText('Salvar Observação')).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios (impedir envio vazio)', async () => {
    const user = userEvent.setup();
    render(
      <NewNoteDialog 
        isOpen={true} 
        onOpenChange={onOpenChange} 
        students={mockStudents} 
      />
    );

    // Tenta salvar sem preencher nada
    await user.click(screen.getByRole('button', { name: /Salvar Observação/i }));

    // Verifica se as mensagens de erro do Zod apareceram
    await waitFor(() => {
      expect(screen.getByText('Por favor, selecione um estudante.')).toBeInTheDocument();
      expect(screen.getByText('A observação deve ter pelo menos 10 caracteres.')).toBeInTheDocument();
    });
    
    // Garante que a mutação NÃO foi chamada
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('deve validar o comprimento mínimo da nota', async () => {
    const user = userEvent.setup();
    render(
      <NewNoteDialog 
        isOpen={true} 
        onOpenChange={onOpenChange} 
        students={mockStudents} 
      />
    );

    // Seleciona um estudante (simulando a interação com Select do Shadcn)
    // Nota: Selects do Radix UI são complexos de testar, muitas vezes testamos o efeito ou usamos mocks.
    // Aqui vamos focar na validação da Textarea que é mais direta.
    
    const textarea = screen.getByLabelText('Observação');
    await user.type(textarea, 'Curto'); // Menos de 10 chars
    await user.click(screen.getByRole('button', { name: /Salvar Observação/i }));

    await waitFor(() => {
      expect(screen.getByText('A observação deve ter pelo menos 10 caracteres.')).toBeInTheDocument();
    });
  });

  it('deve chamar a mutação com os dados corretos ao submeter formulário válido', async () => {
    const user = userEvent.setup();
    
    render(
      <NewNoteDialog 
        isOpen={true} 
        onOpenChange={onOpenChange} 
        students={mockStudents} 
      />
    );

    // 1. Abrir o Select
    const selectTrigger = screen.getByRole('combobox');
    await user.click(selectTrigger);
    
    // 2. Selecionar o estudante "João Silva"
    const option = await screen.findByRole('option', { name: 'João Silva' });
    await user.click(option);

    // 3. Preencher a observação
    const noteText = 'O estudante apresentou excelente progresso hoje.';
    await user.type(screen.getByLabelText('Observação'), noteText);

    // 4. Clicar em salvar
    await user.click(screen.getByRole('button', { name: /Salvar Observação/i }));

    // 5. Verificar se mutate foi chamado com o ID correto e o texto
    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1);
      expect(mutateMock).toHaveBeenCalledWith({
        studentId: 'estudante-1',
        note: noteText,
        caregiverProfileId: 'cuidador-123'
      });
    });
  });

  it('deve exibir estado de carregamento durante a submissão', () => {
    // Forçamos o estado de "pendente" (loading) na mutation
    useMutationMock.mockReturnValue({
      mutate: mutateMock,
      isPending: true,
    });

    render(
      <NewNoteDialog 
        isOpen={true} 
        onOpenChange={onOpenChange} 
        students={mockStudents} 
      />
    );

    const button = screen.getByRole('button', { name: /Salvando.../i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
