import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PdfViewerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  filePath: string | null;
  fileName?: string;
}

export function PdfViewerDialog({ isOpen, onOpenChange, filePath, fileName = "Laudo" }: PdfViewerDialogProps) {
  const { data: signedUrl, isLoading, isError, error } = useQuery({
    queryKey: ['pdf-signed-url', filePath],
    queryFn: async () => {
      if (!filePath) return null;
      const { data, error } = await supabase.storage
        .from('laudos')
        .createSignedUrl(filePath, 300); // URL válida por 5 minutos
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: isOpen && !!filePath, // Só executa a query quando o modal está aberto e há um arquivo
    staleTime: 1000 * 60 * 4, // Reutiliza a URL por 4 minutos
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Visualizador de Laudo</DialogTitle>
          <DialogDescription>{fileName}</DialogDescription>
        </DialogHeader>
        <div className="h-full w-full flex items-center justify-center border rounded-md bg-secondary/20">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
          {isError && (
            <div className="text-center text-destructive">
              <AlertCircle className="mx-auto h-8 w-8" />
              <p className="mt-2 font-semibold">Erro ao carregar o documento</p>
              <p className="text-xs">{error.message}</p>
            </div>
          )}
          {signedUrl && (
            <iframe src={signedUrl} className="h-full w-full" title="Visualizador de PDF" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}