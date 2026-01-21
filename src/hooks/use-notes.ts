import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Interface manual para garantir o tipo correto
export type Note = {
  id: string;
  content: string;
  timestamp: number;
  created_at: string;
  lesson_id: string;
  user_id: string;
};

export function useNotes(lessonId: string | undefined) {
  const queryClient = useQueryClient();

  // 1. Hook de Leitura (Query)
  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes", lessonId],
    queryFn: async () => {
      if (!lessonId) return [];

      // TRUQUE DE MESTRE:
      // Usamos 'as any' na tabela para driblar a verificação de tipos desatualizada.
      // Em seguida, tratamos a resposta como 'any' para evitar erro de conversão.
      const response = await supabase
        .from("lesson_notes" as any)
        .select("*")
        .eq("lesson_id", lessonId)
        .order("timestamp", { ascending: true });

      const { data, error } = response as any;

      if (error) {
        console.error("Erro ao buscar notas:", error);
        throw error;
      }

      // Finalmente, dizemos que isso é uma lista de Note[]
      return data as Note[];
    },
    enabled: !!lessonId,
  });

  // 2. Hook de Adição (Mutation)
  const addNote = useMutation({
    mutationFn: async ({
      content,
      timestamp,
    }: {
      content: string;
      timestamp: number;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !lessonId) throw new Error("Erro de autenticação");

      const response = await supabase.from("lesson_notes" as any).insert({
        user_id: user.id,
        lesson_id: lessonId,
        content,
        timestamp: Math.floor(timestamp), // Arredonda para segundos inteiros
      });

      const { error } = response as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", lessonId] });
    },
  });

  // 3. Hook de Remoção (Mutation)
  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const response = await supabase
        .from("lesson_notes" as any)
        .delete()
        .eq("id", noteId);

      const { error } = response as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", lessonId] });
    },
  });

  return { notes, isLoading, addNote, deleteNote };
}
