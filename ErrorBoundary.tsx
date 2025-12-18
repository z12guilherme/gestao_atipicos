import React, { Component, ErrorInfo, ReactNode } from 'react';
import { correlationLogger as logger } from '@/lib/correlation';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error({ err: error, componentStack: errorInfo.componentStack }, "Erro de renderização não capturado (ErrorBoundary)");
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-destructive bg-destructive/10 p-8 text-center text-destructive">
          <h2 className="text-2xl font-bold">Algo deu errado</h2>
          <p className="mt-2">Ocorreu um erro inesperado que impediu a renderização desta parte da aplicação.</p>
          <Button variant="destructive" className="mt-4" onClick={() => window.location.reload()}>Recarregar a Página</Button>
        </div>
      );
    }

    return this.props.children;
  }
}