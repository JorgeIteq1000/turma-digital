import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  FileText,
  Share2,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/lessons/VideoPlayer";
import { Logo } from "@/components/icons/Logo";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLesson } from "@/hooks/use-lessons";
import { supabase } from "@/integrations/supabase/client";

export default function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hasStartedWatching, setHasStartedWatching] = useState(false);

  const { data: lesson, isLoading } = useLesson(id);

  useEffect(() => {
    const recordView = async () => {
      if (hasStartedWatching && lesson?.id && id) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("lesson_views").upsert(
            {
              user_id: user.id,
              lesson_id: lesson.id,
              viewed_at: new Date().toISOString(),
            },
            { onConflict: "user_id, lesson_id" },
          );
        }
      }
    };
    recordView();
  }, [hasStartedWatching, lesson?.id, id]);

  // --- 🛠️ FUNÇÃO DE CORREÇÃO DE URL ---
  const getSafeUrl = (url: string | null) => {
    if (!url) return "#";
    // Se o link não começar com http:// ou https://, a gente adiciona na marra
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Aula não encontrada</h1>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }

  const scheduledDate = new Date(lesson.scheduled_at);
  const formattedDate = format(scheduledDate, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
  const formattedTime = format(scheduledDate, "HH:mm");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg">
        <div className="container flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{lesson.title}</p>
          </div>
          <Logo size="sm" showText={false} />
        </div>
      </header>

      {/* Video Section */}
      <div className="bg-foreground/5">
        <div className="container px-0 md:px-4 md:py-4">
          <VideoPlayer
            youtubeUrl={lesson.youtube_url}
            isLocked={!lesson.is_published}
            className="md:rounded-xl"
            onPlay={() => setHasStartedWatching(true)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Title & Meta */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <BookOpen className="h-3 w-3" />
                {lesson.class_groups?.name || "Turma Geral"}
              </span>
            </div>
            <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              {lesson.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Actions (Botão do Topo) */}
          <div className="flex flex-wrap gap-3">
            {lesson.material_url && (
              <Button variant="outline" className="gap-2" asChild>
                <a
                  href={getSafeUrl(lesson.material_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  {lesson.material_name || "Baixar Material"}
                </a>
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          {lesson.description && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 font-display text-lg font-semibold">
                Sobre esta aula
              </h2>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
                {lesson.description}
              </p>
            </div>
          )}

          {/* Material Card (Card do Fundo) */}
          {lesson.material_url && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">
                Material de Apoio
              </h2>
              <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/50 p-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {lesson.material_name || "Material da Aula"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clique para acessar
                  </p>
                </div>
                <Button size="sm" variant="outline" className="gap-2" asChild>
                  <a
                    href={getSafeUrl(lesson.material_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                    Abrir
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
