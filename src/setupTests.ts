import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpa o DOM após cada teste para evitar efeitos colaterais
afterEach(() => {
  cleanup();
});

// Mock dos métodos de PointerCapture que não existem no JSDOM
// Isso resolve o erro "target.hasPointerCapture is not a function" ao testar componentes Radix UI (Select, Dialog, etc)
window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
window.HTMLElement.prototype.setPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();