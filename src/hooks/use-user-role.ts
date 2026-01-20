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
    // Mantém o dado em cache por 5 minutos para não consultar o banco a cada clique
    staleTime: 1000 * 60 * 5,
  });
}
