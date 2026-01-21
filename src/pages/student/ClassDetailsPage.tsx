import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LessonCard } from "@/components/lessons/LessonCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useClassLessons } from "@/hooks/use-lessons";

export default function ClassDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useClassLessons(id);

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

  const className = lessons?.[0]?.class_groups?.name || "Detalhes da Turma";

  return (
    <DashboardLayout
      userName="Aluno"
      userEmail=""
      onLogout={() => navigate("/")}
    >
      <div className="space-y-6">
        {/* Header com Voltar */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              {className}
            </h1>
            <p className="text-muted-foreground">
              Cronograma completo de aulas desta turma.
            </p>
          </div>
        </div>

        {/* Lista de Aulas */}
        {!lessons || lessons.length === 0 ? (
          <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
            Nenhuma aula encontrada nesta turma.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => {
              // Lógica simples: Se já passou a data, libera o Play.
              const isAvailable = new Date(lesson.scheduled_at) <= new Date();

              return (
                <LessonCard
                  key={lesson.id}
                  id={lesson.id}
                  title={lesson.title}
                  description={lesson.description || ""}
                  scheduledAt={new Date(lesson.scheduled_at)}
                  isAvailable={isAvailable} // Controla se o botão ativa ou não
                  hasMaterial={!!lesson.material_url}
                  materialUrl={lesson.material_url}
                  onWatch={() => handleWatchLesson(lesson.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
