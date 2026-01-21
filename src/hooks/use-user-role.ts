import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  return useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar função do usuário:", error);
        return "student"; // Fallback seguro
      }

      return data?.role || "student";
    },
    // Mantém o dado em cache por 5 minutos
    staleTime: 1000 * 60 * 5,
  });
}

// NOVA FUNÇÃO: Verifica se o usuário é DEMO
export function useIsDemo() {
  return useQuery({
    queryKey: ["is-demo"],
    queryFn: async () => {
      console.log("🔍 Verificando status de demonstração...");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("profiles")
        .select("is_demo")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("❌ Erro ao verificar status demo:", error);
        return false;
      }

      console.log("✅ Status Demo:", data?.is_demo);
      return data?.is_demo || false;
    },
    staleTime: 1000 * 60 * 5,
  });
}
