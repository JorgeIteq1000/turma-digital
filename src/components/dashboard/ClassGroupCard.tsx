import { BookOpen, Calendar, ChevronRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ClassGroupCardProps {
  id: string;
  name: string;
  courseName: string;
  description?: string;
  lessonsCount: number;
  imageUrl?: string | null;
  nextLessonDate?: Date;
  onClick?: () => void;
  className?: string;
}

export function ClassGroupCard({
  name,
  courseName,
  description,
  lessonsCount,
  imageUrl,
  nextLessonDate,
  onClick,
  className,
}: ClassGroupCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md",
        className,
      )}
    >
      {/* Imagem de Capa */}
      <div className="relative h-32 w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={courseName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <GraduationCap className="h-12 w-12 text-primary/40" />
          </div>
        )}

        {/* Badge do Curso */}
        <div className="absolute left-4 top-4 rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
          {courseName}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary">
          {name}
        </h3>

        {description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        )}

        <div className="mt-auto space-y-4 pt-4">
          {/* Info Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{lessonsCount} aulas</span>
            </div>
            {nextLessonDate && (
              <div className="flex items-center gap-1.5 text-warning">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Próxima: {format(nextLessonDate, "dd/MM", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>

          <Button
            className="w-full gap-2"
            size="sm"
            variant="secondary"
            onClick={onClick}
          >
            Acessar Turma
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
