import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type ClassGroup = Tables<"class_groups"> & {
  courses?: Tables<"courses"> | null;
};
export type ClassGroupInsert = TablesInsert<"class_groups">;
export type ClassGroupUpdate = TablesUpdate<"class_groups">;

export function useClassGroups() {
  return useQuery({
    queryKey: ["class_groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_groups")
        .select(`
          *,
          courses (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ClassGroup[];
    },
  });
}

export function useClassGroup(id: string | undefined) {
  return useQuery({
    queryKey: ["class_groups", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("class_groups")
        .select(`
          *,
          courses (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ClassGroup;
    },
    enabled: !!id,
  });
}

export function useCreateClassGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classGroup: ClassGroupInsert) => {
      const { data, error } = await supabase
        .from("class_groups")
        .insert(classGroup)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class_groups"] });
      toast.success("Turma criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar turma: " + error.message);
    },
  });
}

export function useUpdateClassGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...classGroup }: ClassGroupUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("class_groups")
        .update(classGroup)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class_groups"] });
      toast.success("Turma atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar turma: " + error.message);
    },
  });
}

export function useDeleteClassGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("class_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class_groups"] });
      toast.success("Turma excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir turma: " + error.message);
    },
  });
}
