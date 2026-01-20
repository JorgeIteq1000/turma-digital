import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  TrendingUp,
  Eye,
  Plus,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data - will be replaced with Supabase queries
const mockRecentActivity = [
  {
    id: "1",
    studentName: "Maria Santos",
    lessonTitle: "Introdução aos Contratos",
    viewedAt: subDays(new Date(), 0),
    className: "Turma A - Direito Civil",
  },
  {
    id: "2",
    studentName: "Pedro Costa",
    lessonTitle: "Marketing Digital - Estratégias",
    viewedAt: subDays(new Date(), 0),
    className: "Turma B - Administração",
  },
  {
    id: "3",
    studentName: "Ana Oliveira",
    lessonTitle: "Gestão de Pessoas",
    viewedAt: subDays(new Date(), 1),
    className: "Turma B - Administração",
  },
  {
    id: "4",
    studentName: "Carlos Silva",
    lessonTitle: "Direito Trabalhista",
    viewedAt: subDays(new Date(), 1),
    className: "Turma C - Direito Trabalho",
  },
];

const mockUpcomingLessons = [
  {
    id: "1",
    title: "Contratos - Parte 2",
    scheduledAt: new Date(Date.now() + 86400000 * 2),
    className: "Turma A - Direito Civil",
    studentsEnrolled: 45,
  },
  {
    id: "2",
    title: "Liderança Situacional",
    scheduledAt: new Date(Date.now() + 86400000 * 3),
    className: "Turma B - Administração",
    studentsEnrolled: 32,
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

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
              Gerencie cursos, turmas, aulas e alunos.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/lessons/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Aula
            </Button>
            <Button onClick={() => navigate("/admin/students/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Aluno
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Alunos"
            value={156}
            icon={Users}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Cursos Ativos"
            value={4}
            icon={GraduationCap}
            variant="success"
          />
          <StatsCard
            title="Turmas"
            value={8}
            icon={BookOpen}
          />
          <StatsCard
            title="Aulas este Mês"
            value={24}
            icon={Calendar}
            variant="warning"
            trend={{ value: 8, isPositive: true }}
          />
        </section>

        {/* Quick Actions Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-6"
            onClick={() => navigate("/admin/courses")}
          >
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-base font-medium">Gerenciar Cursos</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-6"
            onClick={() => navigate("/admin/classes")}
          >
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-base font-medium">Gerenciar Turmas</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-6"
            onClick={() => navigate("/admin/lessons")}
          >
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-base font-medium">Gerenciar Aulas</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-6"
            onClick={() => navigate("/admin/reports")}
          >
            <Eye className="h-8 w-8 text-primary" />
            <span className="text-base font-medium">Ver Relatórios</span>
          </Button>
        </section>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <section className="card-elevated p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Atividade Recente
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/reports")}
              >
                Ver tudo
              </Button>
            </div>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-foreground">
                      {activity.studentName}
                    </p>
                    <p className="text-muted-foreground">
                      Assistiu: {activity.lessonTitle}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(activity.viewedAt, "dd/MM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Lessons */}
          <section className="card-elevated p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Próximas Aulas
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/lessons")}
              >
                Ver todas
              </Button>
            </div>
            <div className="space-y-3">
              {mockUpcomingLessons.map((lesson) => (
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
                        {lesson.className}
                      </p>
                    </div>
                    <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                      {format(lesson.scheduledAt, "dd/MM HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {lesson.studentsEnrolled} alunos matriculados
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
