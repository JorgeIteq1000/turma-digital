import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/use-user-role";

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "student";
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const [session, setSession] = useState<boolean | null>(null);
  const location = useLocation();
  const { data: role, isLoading: isLoadingRole } = useUserRole();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Verificando sessão inicial
  if (session === null || isLoadingRole) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Se não tem sessão, manda pro login
  if (session === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Se requer Admin mas o usuário é Aluno
  if (requiredRole === "admin" && role !== "admin") {
    toast.error("Acesso não autorizado.");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
