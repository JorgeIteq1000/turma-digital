import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  FileText,
  Share2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/lessons/VideoPlayer";
import { Logo } from "@/components/icons/Logo";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { subHours } from "date-fns";

// Mock lesson data - will be replaced with Supabase
const mockLesson = {
  id: "3",
  title: "Introdução aos Contratos - Parte 1",
  description:
    "Nesta aula, exploramos os fundamentos dos contratos no direito civil brasileiro. Abordaremos os elementos essenciais, classificações e principais características que todo profissional do direito precisa conhecer.",
  scheduledAt: subHours(new Date(), 48),
  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  hasMaterial: true,
  materialName: "Material Complementar - Contratos.pdf",
  materialUrl: "#",
  classGroup: {
    id: "1",
    name: "Turma A - Direito Civil",
    courseName: "Direito",
  },
  isAvailable: true,
};

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [hasStartedWatching, setHasStartedWatching] = useState(false);

  // Record view when video starts playing
  useEffect(() => {
    if (hasStartedWatching) {
      // Will record view in Supabase
      console.log("Recording view for lesson:", lessonId);
    }
  }, [hasStartedWatching, lessonId]);

  const lesson = mockLesson; // Will be fetched from Supabase

  const formattedDate = format(lesson.scheduledAt, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
  const formattedTime = format(lesson.scheduledAt, "HH:mm");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg">
        <div className="container flex h-14 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(-1)}
          >
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
            youtubeUrl={lesson.youtubeUrl}
            isLocked={!lesson.isAvailable}
            className="md:rounded-xl"
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
                {lesson.classGroup.name}
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

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {lesson.hasMaterial && (
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {lesson.materialName || "Baixar Material"}
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 font-display text-lg font-semibold">
              Sobre esta aula
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {lesson.description}
            </p>
          </div>

          {/* Material Card */}
          {lesson.hasMaterial && (
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
                    {lesson.materialName}
                  </p>
                  <p className="text-sm text-muted-foreground">PDF • 2.4 MB</p>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Baixar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
