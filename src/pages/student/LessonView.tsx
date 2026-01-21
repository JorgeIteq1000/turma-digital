import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer, VideoPlayerRef } from "@/components/lessons/VideoPlayer";
import { LessonNotes } from "@/components/lessons/LessonNotes";
import { Logo } from "@/components/icons/Logo";
import { useLesson } from "@/hooks/use-lessons";
import { useIsDemo } from "@/hooks/use-user-role"; // <--- Importado
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast"; // <--- Importado

export default function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast(); // <--- Hook de toast
  const [hasStartedWatching, setHasStartedWatching] = useState(false);

  // Verificação de Demo
  const { data: isDemo } = useIsDemo();

  // Referência para controlar o player de fora
  const playerRef = useRef<VideoPlayerRef>(null);

  const { data: lesson, isLoading } = useLesson(id);

  // Registro de View (Mantido)
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

  // Função para bloquear download
  const handleDownloadClick = (e: React.MouseEvent) => {
    if (isDemo) {
      e.preventDefault(); // Impede o link de abrir
      console.log("🚫 Download bloqueado: Usuário Demo");
      toast({
        variant: "destructive",
        title: "Acesso Restrito",
        description: "Download somente para Alunos Matriculados.",
      });
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (!lesson)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Aula não encontrada</h1>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-10">
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

      <div className="container px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Coluna da Esquerda: Vídeo + Descrição */}
          <div className="space-y-6">
            <VideoPlayer
              ref={playerRef} // Conectamos a ref aqui
              youtubeUrl={lesson.youtube_url}
              isLocked={!lesson.is_published}
              className="md:rounded-xl shadow-lg"
              onPlay={() => setHasStartedWatching(true)}
            />

            <div className="space-y-4">
              <h1 className="font-display text-2xl font-bold">
                {lesson.title}
              </h1>
              {lesson.description && (
                <div className="rounded-xl border bg-card p-5">
                  <h3 className="font-semibold mb-2">Sobre esta aula</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {lesson.description}
                  </p>
                </div>
              )}

              {/* Material de Apoio (Com Trava Demo) */}
              {lesson.material_url && (
                <div className="rounded-xl border bg-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Material de Apoio</p>
                    <p className="text-sm text-muted-foreground">
                      {lesson.material_name || "Download disponível"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    asChild={!isDemo} // Se for demo, não renderiza como 'a' (link), mas sim como botão normal para pegar o onClick
                    onClick={isDemo ? handleDownloadClick : undefined}
                  >
                    {isDemo ? (
                      // Renderização para Demo (Botão falso)
                      <span className="cursor-pointer">Baixar</span>
                    ) : (
                      // Renderização Normal (Link)
                      <a
                        href={lesson.material_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Baixar
                      </a>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Coluna da Direita: Caderno de Notas */}
          <div className="lg:h-[calc(100vh-120px)] lg:sticky lg:top-20">
            <LessonNotes
              lessonId={lesson.id}
              // Passamos as funções do player para o caderno
              getCurrentTime={() => playerRef.current?.getCurrentTime() || 0}
              onSeek={(time) => playerRef.current?.seekTo(time)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
