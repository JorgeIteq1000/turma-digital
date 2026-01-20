import { BookOpen, Calendar, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClassGroupCardProps {
  id: string;
  name: string;
  courseName: string;
  description?: string;
  lessonsCount: number;
  upcomingCount: number;
  recordedCount: number;
  nextLessonDate?: Date;
  thumbnailUrl?: string;
  onClick?: () => void;
  className?: string;
}

export function ClassGroupCard({
  id,
  name,
  courseName,
  description,
  lessonsCount,
  upcomingCount,
  recordedCount,
  nextLessonDate,
  thumbnailUrl,
  onClick,
  className,
}: ClassGroupCardProps) {
  return (
    <div
      className={cn(
        "card-elevated group cursor-pointer overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      {/* Header with thumbnail */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <span className="inline-block rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
            {courseName}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
          {name}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{lessonsCount} aulas</span>
          </div>
          {upcomingCount > 0 && (
            <div className="flex items-center gap-1.5 text-warning">
              <Calendar className="h-4 w-4" />
              <span>{upcomingCount} próximas</span>
            </div>
          )}
          {recordedCount > 0 && (
            <div className="flex items-center gap-1.5 text-success">
              <span>{recordedCount} gravadas</span>
            </div>
          )}
        </div>

        {/* Next lesson */}
        {nextLessonDate && (
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">
              Próxima aula:{" "}
              <span className="font-medium text-foreground">
                {format(nextLessonDate, "dd/MM 'às' HH:mm", { locale: ptBR })}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </div>
  );
}
