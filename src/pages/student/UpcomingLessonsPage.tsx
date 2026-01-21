import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LessonCard } from "@/components/lessons/LessonCard";
import { Calendar, Loader2 } from "lucide-react";
import { useStudentLessons } from "@/hooks/use-lessons";

export default function UpcomingLessonsPage() {
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useStudentLessons();

  // Filtra apenas aulas que ainda vão acontecer (Data Futura)
  const upcomingLessons =
    lessons?.filter((l) => new Date(l.scheduled_at) > new Date()) || [];

  return (
    <DashboardLayout
      userName="Aluno"
      userEmail=""
      onLogout={() => navigate("/")}
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            📅 Próximas Aulas
          </h1>
          <p className="text-muted-foreground">
            Agenda completa das suas aulas ao vivo.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : upcomingLessons.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <Calendar className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-lg font-medium">Nenhuma aula futura agendada</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                description={lesson.description || ""}
                scheduledAt={new Date(lesson.scheduled_at)}
                isAvailable={false}
                hasMaterial={!!lesson.material_url}
                materialUrl={lesson.material_url}
                onWatch={() => navigate(`/lessons/${lesson.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
