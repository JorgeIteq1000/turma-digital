import { useUserRole } from "@/hooks/use-user-role";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RequireAuthProps {
  children?: React.ReactNode;
  requiredRole?: "admin" | "student" | "manager" | "seller";
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  // CORREÇÃO AQUI: Desestruturando { data: role } em vez de { role }
  const { data: role, isLoading: roleLoading } = useUserRole();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoExpired, setIsDemoExpired] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Função separada para verificar o acesso Demo
    const checkDemoAccess = async (userId: string) => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_demo, demo_hours, created_at")
          .eq("id", userId)
          .single();

        if (error || !profile) return true; // Se der erro, assume liberado para não bloquear à toa

        // SE FOR DEMO, VERIFICA O TEMPO
        if (profile.is_demo && profile.demo_hours && profile.created_at) {
          const createdAt = new Date(profile.created_at).getTime();
          const now = new Date().getTime();
          const hoursInMillis = profile.demo_hours * 60 * 60 * 1000;
          const expirationTime = createdAt + hoursInMillis;

          if (now > expirationTime) {
            console.log("🚫 Tempo de demonstração expirado.");

            // Logout forçado
            await supabase.auth.signOut();

            if (mounted) {
              setIsDemoExpired(true);
              toast({
                variant: "destructive",
                title: "Período de Teste Encerrado",
                description:
                  "Seu tempo de demonstração expirou. Entre em contato com o comercial para adquirir o acesso completo.",
                duration: 6000,
              });
            }
            return false; // Expirado
          }
        }
        return true; // Acesso liberado
      } catch (err) {
        console.error("Erro ao verificar demo:", err);
        return true;
      }
    };

    const validateSession = async (session: any) => {
      if (session) {
        const isAccessValid = await checkDemoAccess(session.user.id);
        if (isAccessValid !== false) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setSessionLoading(false);
    };

    // Check inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) validateSession(session);
    });

    // Listener de mudança de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) validateSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  if (sessionLoading || roleLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Verificando credenciais...
          </p>
        </div>
      </div>
    );
  }

  // Se o demo expirou, manda pro login
  if (isDemoExpired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole && role !== "admin") {
    // Admin tem acesso mestre
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
