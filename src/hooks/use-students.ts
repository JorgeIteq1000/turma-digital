import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type UserRole = Tables<"user_roles">;
export type ClassEnrollment = Tables<"class_enrollments"> & {
  class_groups?: Tables<"class_groups"> | null;
};

export type StudentWithEnrollments = Profile & {
  user_roles?: UserRole[];
  class_enrollments?: ClassEnrollment[];
};

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      // First get all profiles with student role
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Get all enrollments with class group info
      const { data: enrollments, error: enrollmentsError } =
        await supabase.from("class_enrollments").select(`
          *,
          class_groups (*)
        `);

      if (enrollmentsError) throw enrollmentsError;

      // Filter only students and combine data
      const studentIds = new Set(
        roles.filter((r) => r.role === "student").map((r) => r.user_id),
      );

      const students = profiles
        .filter((p) => studentIds.has(p.id))
        .map((profile) => ({
          ...profile,
          user_roles: roles.filter((r) => r.user_id === profile.id),
          class_enrollments: enrollments.filter(
            (e) => e.user_id === profile.id,
          ),
        }));

      return students as StudentWithEnrollments[];
    },
  });
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      if (!id) return null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;

      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("class_enrollments")
        .select(
          `
          *,
          class_groups (*)
        `,
        )
        .eq("user_id", id);

      if (enrollmentsError) throw enrollmentsError;

      return {
        ...profile,
        class_enrollments: enrollments,
      } as StudentWithEnrollments;
    },
    enabled: !!id,
  });
}

export function useEnrollStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      classGroupId,
    }: {
      userId: string;
      classGroupId: string;
    }) => {
      const { data, error } = await supabase
        .from("class_enrollments")
        .insert({
          user_id: userId,
          class_group_id: classGroupId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["class_enrollments"] });
      toast.success("Aluno matriculado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao matricular aluno: " + error.message);
    },
  });
}

export function useUnenrollStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      classGroupId,
    }: {
      userId: string;
      classGroupId: string;
    }) => {
      const { error } = await supabase
        .from("class_enrollments")
        .delete()
        .eq("user_id", userId)
        .eq("class_group_id", classGroupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["class_enrollments"] });
      toast.success("Matrícula removida com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao remover matrícula: " + error.message);
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      full_name,
    }: {
      email: string;
      password: string;
      full_name: string;
    }) => {
      // Nota: Em produção, o ideal é usar uma Edge Function para criar usuários sem deslogar o admin.
      // Aqui usamos o signUp padrão.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name,
          },
        },
      });

      if (error) throw error;

      // Se o usuário foi criado, mas a sessão mudou, o Admin pode ser deslogado.
      // Isso é um comportamento padrão do Supabase Client.
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(
        "Aluno cadastrado! (Verifique se precisa confirmar o email)",
      );
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar aluno: " + error.message);
    },
  });
}

export function useUpdateStudentEnrollments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      classGroupIds,
    }: {
      userId: string;
      classGroupIds: string[];
    }) => {
      // Get current enrollments
      const { data: currentEnrollments, error: fetchError } = await supabase
        .from("class_enrollments")
        .select("class_group_id")
        .eq("user_id", userId);

      if (fetchError) throw fetchError;

      const currentIds = new Set(
        currentEnrollments.map((e) => e.class_group_id),
      );
      const newIds = new Set(classGroupIds);

      // Find enrollments to add
      const toAdd = classGroupIds.filter((id) => !currentIds.has(id));

      // Find enrollments to remove
      const toRemove = currentEnrollments
        .filter((e) => !newIds.has(e.class_group_id))
        .map((e) => e.class_group_id);

      // Add new enrollments
      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from("class_enrollments")
          .insert(
            toAdd.map((classGroupId) => ({
              user_id: userId,
              class_group_id: classGroupId,
            })),
          );

        if (insertError) throw insertError;
      }

      // Remove old enrollments
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("class_enrollments")
          .delete()
          .eq("user_id", userId)
          .in("class_group_id", toRemove);

        if (deleteError) throw deleteError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["class_enrollments"] });
      toast.success("Matrículas atualizadas com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar matrículas: " + error.message);
    },
  });
}
