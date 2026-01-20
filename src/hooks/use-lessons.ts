import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Lesson = Tables<"lessons"> & {
  class_groups?: (Tables<"class_groups"> & {
    courses?: Tables<"courses"> | null;
  }) | null;
};
export type LessonInsert = TablesInsert<"lessons">;
export type LessonUpdate = TablesUpdate<"lessons">;

export function useLessons() {
  return useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select(`
          *,
          class_groups (
            *,
            courses (*)
          )
        `)
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      return data as Lesson[];
    },
  });
}

export function useLesson(id: string | undefined) {
  return useQuery({
    queryKey: ["lessons", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("lessons")
        .select(`
          *,
          class_groups (
            *,
            courses (*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Lesson;
    },
    enabled: !!id,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lesson: LessonInsert) => {
      const { data, error } = await supabase
        .from("lessons")
        .insert(lesson)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast.success("Aula criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar aula: " + error.message);
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...lesson }: LessonUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("lessons")
        .update(lesson)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast.success("Aula atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar aula: " + error.message);
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast.success("Aula excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir aula: " + error.message);
    },
  });
}
