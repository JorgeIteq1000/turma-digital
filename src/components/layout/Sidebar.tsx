import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Calendar,
  User,
  Settings,
  Users,
  BarChart3,
  GraduationCap,
  FolderOpen,
  X,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface SidebarProps {
  isAdmin?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const studentNavItems: NavItem[] = [
  { icon: Home, label: "Início", href: "/dashboard" },
  { icon: Calendar, label: "Próximas Aulas", href: "/upcoming" },
  { icon: BookOpen, label: "Aulas Gravadas", href: "/recorded" },
  { icon: FolderOpen, label: "Materiais", href: "/materials" },
  { icon: User, label: "Meu Perfil", href: "/profile" },
];

const adminNavItems: NavItem[] = [
  { icon: Home, label: "Painel Geral", href: "/admin" },
  { icon: GraduationCap, label: "Cursos", href: "/admin/courses" },
  { icon: BookOpen, label: "Turmas", href: "/admin/classes" },
  { icon: Calendar, label: "Aulas", href: "/admin/lessons" },
  { icon: Users, label: "Alunos", href: "/admin/students" },
  { icon: BarChart3, label: "Relatórios", href: "/admin/reports" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
];

export function Sidebar({ isAdmin = false, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = isAdmin ? adminNavItems : studentNavItems;

  // State para armazenar dados do usuário real
  const [profile, setProfile] = useState<{
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Busca dados do usuário ao carregar
  useEffect(() => {
    const getProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Busca perfil detalhado na tabela profiles
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name, email, avatar_url")
            .eq("id", user.id)
            .maybeSingle(); // maybeSingle evita erro se não encontrar

          if (data) {
            setProfile(data);
          } else {
            // Fallback se não tiver perfil criado ainda
            setProfile({
              full_name: user.user_metadata?.full_name || "Usuário",
              email: user.email || "",
              avatar_url: null,
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  // Função de Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Você saiu da conta.");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao sair.");
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header da Sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Logo
            size="sm"
            iconClassName="bg-sidebar-primary"
            textClassName="text-sidebar-foreground"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Rodapé com Perfil do Usuário */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between gap-3 rounded-lg bg-sidebar-accent/50 p-2">
            {loading ? (
              // Skeleton Loading
              <div className="flex items-center gap-3 w-full">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1 w-full">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-24" />
                </div>
              </div>
            ) : (
              // Dados Reais
              <>
                <div className="flex items-center gap-3 overflow-hidden">
                  <Avatar className="h-9 w-9 border border-sidebar-border">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-sidebar-foreground">
                      {profile?.full_name}
                    </span>
                    <span
                      className="truncate text-xs text-muted-foreground"
                      title={profile?.email || ""}
                    >
                      {profile?.email}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="mt-2 text-center">
            <p className="text-[10px] text-sidebar-foreground/30">
              © 2026 EduConnect v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
