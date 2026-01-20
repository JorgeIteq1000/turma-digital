import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays } from "date-fns";

// --- Hook para o Admin ---
export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // 1. Contagens Totais (Executadas em paralelo para ser rápido)
      const [students, courses, classes, lessons] = await Promise.all([
        supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student"),
        supabase
          .from("courses")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("class_groups")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .gte("scheduled_at", new Date().toISOString()),
      ]);

      // 2. Próximas Aulas (Top 5)
      const { data: upcomingLessons } = await supabase
        .from("lessons")
        .select(
          `
          id, 
          title, 
          scheduled_at,
          class_groups ( name )
        `,
        )
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(5);

      // 3. Atividade Recente (Últimas 5 visualizações)
      const { data: recentViews } = await supabase
        .from("lesson_views")
        .select(
          `
          viewed_at,
          profiles ( full_name ),
          lessons ( title, class_groups ( name ) )
        `,
        )
        .order("viewed_at", { ascending: false })
        .limit(5);

      return {
        totalStudents: students.count || 0,
        activeCourses: courses.count || 0,
        activeClasses: classes.count || 0,
        upcomingLessonsCount: lessons.count || 0,
        upcomingList: upcomingLessons || [],
        recentActivity: recentViews || [],
      };
    },
  });
}

// --- Hook para o Aluno ---
export function useStudentDashboard() {
  return useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // 1. Minhas Turmas
      const { data: enrollments } = await supabase
        .from("class_enrollments")
        .select(
          `
          class_groups (
            id,
            name,
            description,
            courses ( name )
          )
        `,
        )
        .eq("user_id", user.id)
        .eq("is_active", true);

      const classIds = enrollments?.map((e) => e.class_groups?.id) || [];
      const myClasses = enrollments?.map((e) => e.class_groups) || [];

      // 2. Próximas Aulas (Das turmas que participo)
      let upcomingLessons: any[] = [];
      if (classIds.length > 0) {
        const { data } = await supabase
          .from("lessons")
          .select("*")
          .in("class_group_id", classIds)
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(4);
        upcomingLessons = data || [];
      }

      // 3. Aulas Recentes (Que já passaram)
      let recentLessons: any[] = [];
      if (classIds.length > 0) {
        const { data } = await supabase
          .from("lessons")
          .select("*")
          .in("class_group_id", classIds)
          .lt("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: false })
          .limit(4);
        recentLessons = data || [];
      }

      return {
        myClasses,
        upcomingLessons,
        recentLessons,
        stats: {
          totalClasses: myClasses.length,
          upcomingCount: upcomingLessons.length,
        },
      };
    },
  });
}
