import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LessonCard } from "@/components/lessons/LessonCard";
import { PlayCircle, Loader2 } from "lucide-react";
import { useStudentLessons } from "@/hooks/use-lessons";

export default function RecordedLessonsPage() {
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useStudentLessons();

  // Filtra aulas passadas e inverte (mais recentes no topo)
  const recordedLessons =
    lessons
      ?.filter((l) => new Date(l.scheduled_at) <= new Date())
      .sort(
        (a, b) =>
          new Date(b.scheduled_at).getTime() -
          new Date(a.scheduled_at).getTime(),
      ) || [];

  return (
    <DashboardLayout
      userName="Aluno"
      userEmail=""
      onLogout={() => navigate("/")}
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            🎥 Aulas Gravadas
          </h1>
          <p className="text-muted-foreground">
            Assista ao replay de todo o conteúdo.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recordedLessons.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <PlayCircle className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-lg font-medium">Nenhuma gravação disponível</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recordedLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                description={lesson.description || ""}
                scheduledAt={new Date(lesson.scheduled_at)}
                isAvailable={true}
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
