import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";

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
  const navItems = isAdmin ? adminNavItems : studentNavItems;

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
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
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
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
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

        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/50">
            © 2024 EduConnect
          </p>
        </div>
      </aside>
    </>
  );
}
