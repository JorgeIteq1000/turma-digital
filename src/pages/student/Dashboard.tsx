import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ClassGroupCard } from "@/components/dashboard/ClassGroupCard";
import { LessonCard } from "@/components/lessons/LessonCard";
import { useStudentDashboard } from "@/hooks/use-dashboard";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useStudentDashboard();

  const handleLogout = () => {
    navigate("/");
  };

  const handleWatchLesson = (lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout userName="Aluno" userEmail="" onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <section>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Olá! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Aqui está o resumo dos seus estudos.
          </p>
        </section>

        {/* Stats Reais */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Turmas Matriculadas"
            value={data?.stats.totalClasses || 0}
            icon={BookOpen}
            variant="primary"
          />
          <StatsCard
            title="Próximas Aulas"
            value={data?.stats.upcomingCount || 0}
            icon={Calendar}
            variant="warning"
          />
        </section>

        {/* Minhas Turmas */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Minhas Turmas
            </h2>
          </div>

          {data?.myClasses.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              Você ainda não está matriculado em nenhuma turma.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data?.myClasses.map((classGroup: any) => (
                <ClassGroupCard
                  key={classGroup.id}
                  id={classGroup.id}
                  name={classGroup.name}
                  courseName={classGroup.courses?.name || "Geral"}
                  description={classGroup.description}
                  // AQUI ESTÁ A CORREÇÃO MÁGICA 👇
                  lessonsCount={classGroup.lessonsCount}
                  nextLessonDate={undefined}
                  onClick={() => {}}
                />
              ))}
            </div>
          )}
        </section>

        {/* Próximas Aulas */}
        {data?.upcomingLessons && data.upcomingLessons.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                📅 Próximas Aulas
              </h2>
            </div>
            <div className="space-y-3">
              {data.upcomingLessons.map((lesson: any) => (
                <LessonCard
                  key={lesson.id}
                  id={lesson.id}
                  title={lesson.title}
                  description={lesson.description}
                  scheduledAt={new Date(lesson.scheduled_at)}
                  isAvailable={false}
                  hasMaterial={!!lesson.material_url}
                  materialUrl={lesson.material_url} // <--- ADICIONADO AQUI
                  onWatch={() => handleWatchLesson(lesson.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Aulas Recentes / Passadas */}
        {data?.recentLessons && data.recentLessons.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                ▶️ Aulas Disponíveis
              </h2>
            </div>
            <div className="space-y-3">
              {data.recentLessons.map((lesson: any) => (
                <LessonCard
                  key={lesson.id}
                  id={lesson.id}
                  title={lesson.title}
                  description={lesson.description}
                  scheduledAt={new Date(lesson.scheduled_at)}
                  isAvailable={true}
                  hasMaterial={!!lesson.material_url}
                  materialUrl={lesson.material_url} // <--- ADICIONADO AQUI TAMBÉM
                  onWatch={() => handleWatchLesson(lesson.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
