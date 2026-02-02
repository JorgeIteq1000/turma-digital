import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSchedules() {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_schedules")
        .select(
          `
          *,
          class_groups ( name )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Busca apenas cronogramas do aluno logado (filtrado pela RLS do banco)
export function useStudentSchedules() {
  return useQuery({
    queryKey: ["student-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_schedules")
        .select(
          `
          *,
          class_groups ( name )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      file_url,
      class_group_id,
    }: {
      title: string;
      file_url: string;
      class_group_id: string;
    }) => {
      const { error } = await supabase.from("class_schedules").insert({
        title,
        file_url,
        class_group_id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Cronograma adicionado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar: " + error.message);
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("class_schedules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Cronograma removido!");
    },
    onError: (error) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });
}
