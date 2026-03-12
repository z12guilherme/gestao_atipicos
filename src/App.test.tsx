import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Exemplo simples: Testando se 1 + 1 é 2 (Teste de sanidade)
describe('Setup Inicial', () => {
  it('deve somar corretamente', () => {
    expect(1 + 1).toBe(2);
  });
});

// Exemplo simulado de teste de componente
// Supondo que você tenha um componente de Título ou Login
describe('Componente de Teste', () => {
  it('deve renderizar um texto na tela', () => {
    render(<div>Olá Mundo</div>);
    const elemento = screen.getByText(/Olá Mundo/i);
    expect(elemento).toBeInTheDocument();
  });
});