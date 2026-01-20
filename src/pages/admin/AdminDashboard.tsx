import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  Eye,
  Plus,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAdminStats } from "@/hooks/use-dashboard";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminStats();

  const handleLogout = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout
      isAdmin
      userName="Admin"
      userEmail="admin@faculdade.edu.br"
      onLogout={handleLogout}
    >
      <div className="space-y-8">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Painel Administrativo
            </h1>
            <p className="mt-1 text-muted-foreground">
              Visão geral da sua plataforma de ensino.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/lessons")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Gerenciar Aulas
            </Button>
            <Button onClick={() => navigate("/admin/students")}>
              <Plus className="mr-2 h-4 w-4" />
              Gerenciar Alunos
            </Button>
          </div>
        </section>

        {/* Stats Reais */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Alunos"
            value={stats?.totalStudents || 0}
            icon={Users}
            variant="primary"
          />
          <StatsCard
            title="Cursos Ativos"
            value={stats?.activeCourses || 0}
            icon={GraduationCap}
            variant="success"
          />
          <StatsCard
            title="Turmas Ativas"
            value={stats?.activeClasses || 0}
            icon={BookOpen}
          />
          <StatsCard
            title="Próximas Aulas"
            value={stats?.upcomingLessonsCount || 0}
            icon={Calendar}
            variant="warning"
          />
        </section>

        {/* Layout de Colunas */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Atividade Recente Real */}
          <section className="card-elevated p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Últimas Visualizações
              </h2>
            </div>
            <div className="space-y-4">
              {stats?.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade recente.
                </p>
              ) : (
                stats?.recentActivity.map((activity: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-foreground">
                        {activity.profiles?.full_name || "Usuário"}
                      </p>
                      <p className="text-muted-foreground">
                        Assistiu: {activity.lessons?.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(
                          new Date(activity.viewed_at),
                          "dd/MM 'às' HH:mm",
                          {
                            locale: ptBR,
                          },
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Próximas Aulas Reais */}
          <section className="card-elevated p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Próximas Aulas Agendadas
              </h2>
            </div>
            <div className="space-y-3">
              {stats?.upcomingList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma aula agendada.
                </p>
              ) : (
                stats?.upcomingList.map((lesson: any) => (
                  <div
                    key={lesson.id}
                    className="rounded-lg border border-border/50 bg-muted/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-foreground">
                          {lesson.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {lesson.class_groups?.name}
                        </p>
                      </div>
                      <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                        {format(new Date(lesson.scheduled_at), "dd/MM HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
