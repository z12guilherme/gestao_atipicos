import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Document {
  id: string;
  student_id: string;
  uploaded_by: string;
  title: string;
  description?: string | null;
  file_name: string;
  file_path: string;
  file_size?: number | null;
  file_type?: string | null;
  document_type?: string | null;
  created_at: string;
  // Campos opcionais para joins
  uploader?: { name: string };
}

export function useDocuments(studentId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['documents', studentId];

  const { data: documents, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*, uploader:uploaded_by(name)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!studentId, // A query só será executada se um studentId for fornecido
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ file, documentData }: { file: File, documentData: Omit<Document, 'id' | 'created_at' | 'file_name' | 'file_path' | 'file_size' | 'file_type'> }) => {
      // 1. Upload do arquivo para o Supabase Storage
      const filePath = `${documentData.student_id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw new Error(`Falha no upload: ${uploadError.message}`);

      // 2. Criação do registro na tabela 'documents'
      const { data, error: insertError } = await supabase
        .from('documents')
        .insert({
          ...documentData,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
        })
        .select()
        .single();

      if (insertError) {
        // Rollback: se a inserção no banco falhar, remove o arquivo do storage
        await supabase.storage.from('documents').remove([filePath]);
        throw insertError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Documento enviado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar documento: ${error.message}`);
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (document: Document) => {
      // 1. Deleta o arquivo do Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);
      
      // Não bloqueia se o arquivo não existir no storage, mas loga o erro
      if (storageError) console.warn(`Não foi possível remover o arquivo do storage: ${storageError.message}`);

      // 2. Deleta o registro da tabela 'documents'
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Documento excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir documento: ${error.message}`);
    },
  });

  return {
    documents: documents || [],
    isLoading,
    uploadDocument,
    deleteDocument,
  };
}