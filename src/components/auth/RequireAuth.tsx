import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children?: React.ReactNode;
  requiredRole?: "admin" | "student";
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  // CORREÇÃO AQUI 👇
  // O hook retorna 'data', nós renomeamos para 'role' aqui mesmo.
  const { data: role, isLoading: roleLoading } = useUserRole();

  const [session, setSession] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Verifica sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    // Escuta mudanças na sessão
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Carregando...
  if (session === null || roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Não logado -> Login
  if (session === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Papel errado -> Redireciona para o lugar certo
  if (requiredRole && role !== requiredRole) {
    // Se o role ainda não carregou (é undefined), esperamos.
    // Se carregou e é diferente, redireciona.
    if (role) {
      if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
      if (role === "student") return <Navigate to="/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  // 4. Sucesso! Renderiza o conteúdo
  return children ? <>{children}</> : <Outlet />;
}
