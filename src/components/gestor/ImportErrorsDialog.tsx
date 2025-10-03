import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "../ui/button";

interface ImportErrorsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  errors: { line: number; error: string }[];
  fileName: string;
}

export function ImportErrorsDialog({ isOpen, onOpenChange, errors, fileName }: ImportErrorsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Erros na importação do arquivo: {fileName}</DialogTitle>
          <DialogDescription>
            Corrija os erros listados abaixo na sua planilha e tente importar o arquivo novamente.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Linha</TableHead><TableHead>Erro</TableHead></TableRow></TableHeader>
            <TableBody>
              {errors.map((err, index) => (
                <TableRow key={index}><TableCell>{err.line}</TableCell><TableCell>{err.error}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}