import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Definindo a tipagem manualmente para o componente saber o que esperar
export type AppNotification = {
  id: string;
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  created_at: string;
  type: "db" | "live";
};

export function useNotifications() {
  const queryClient = useQueryClient();

  // 1. Busca Notificações do Banco
  const { data: dbNotifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      // CORREÇÃO: Fazemos a query primeiro, depois tratamos o tipo do resultado
      const response = await supabase
        .from("notifications" as any) // "Engana" o TS sobre o nome da tabela
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      // Agora convertemos a resposta inteira para any para destruturar sem medo
      const { data, error } = response as any;

      if (error) {
        console.error("Erro ao buscar notificações:", error);
        return [];
      }

      // Mapeamos os dados
      return (data as any[]).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        created_at: n.created_at,
        type: "db" as const,
      })) as AppNotification[];
    },
    refetchInterval: 60 * 1000,
  });

  // 2. Busca Aulas Começando Agora
  const { data: liveNotifications = [] } = useQuery({
    queryKey: ["live-notifications"],
    queryFn: async () => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: enrollments } = await supabase
        .from("class_enrollments")
        .select("class_group_id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const classIds = enrollments?.map((e) => e.class_group_id) || [];
      if (classIds.length === 0) return [];

      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, scheduled_at")
        .in("class_group_id", classIds)
        .gte("scheduled_at", oneHourAgo.toISOString())
        .lte("scheduled_at", oneHourLater.toISOString());

      return (lessons?.map((l) => ({
        id: `live-${l.id}`,
        title: "🔴 Acontecendo Agora!",
        message: `A aula "${l.title}" está prestes a começar ou ao vivo.`,
        link: `/lessons/${l.id}`,
        read: false,
        created_at: new Date().toISOString(),
        type: "live" as const,
      })) || []) as AppNotification[];
    },
    refetchInterval: 60 * 1000,
  });

  // Junta tudo e ordena
  const allNotifications = [...liveNotifications, ...dbNotifications].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const unreadCount = allNotifications.filter((n) => !n.read).length;

  // Função para marcar como lida
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      if (!id.startsWith("live-")) {
        // CORREÇÃO: Mesmo padrão aqui, await primeiro, cast depois se necessário
        const response = await supabase
          .from("notifications" as any)
          .update({ read: true })
          .eq("id", id);

        const { error } = response as any;
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const response = await supabase
          .from("notifications" as any)
          .update({ read: true })
          .eq("user_id", user.id);

        const { error } = response as any;
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    notifications: allNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
