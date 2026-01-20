import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Calendar, User, Settings, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface MobileNavProps {
  isAdmin?: boolean;
}

const studentNavItems: NavItem[] = [
  { icon: Home, label: "Início", href: "/dashboard" },
  { icon: Calendar, label: "Próximas", href: "/upcoming" },
  { icon: BookOpen, label: "Gravadas", href: "/recorded" },
  { icon: User, label: "Perfil", href: "/profile" },
];

const adminNavItems: NavItem[] = [
  { icon: Home, label: "Painel", href: "/admin" },
  { icon: BookOpen, label: "Cursos", href: "/admin/courses" },
  { icon: Users, label: "Alunos", href: "/admin/students" },
  { icon: BarChart3, label: "Relatórios", href: "/admin/reports" },
  { icon: Settings, label: "Config", href: "/admin/settings" },
];

export function MobileNav({ isAdmin = false }: MobileNavProps) {
  const location = useLocation();
  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-0.5 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
