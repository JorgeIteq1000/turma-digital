import { Calendar, Clock, Play, Lock, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LessonCardProps {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  isAvailable: boolean;
  isLive?: boolean;
  hasMaterial?: boolean;
  materialName?: string;
  thumbnailUrl?: string;
  onWatch?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function LessonCard({
  id,
  title,
  description,
  scheduledAt,
  isAvailable,
  isLive = false,
  hasMaterial = false,
  materialName,
  thumbnailUrl,
  onWatch,
  onDownload,
  className,
}: LessonCardProps) {
  const formattedDate = format(scheduledAt, "dd 'de' MMMM", { locale: ptBR });
  const formattedTime = format(scheduledAt, "HH:mm");

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all duration-300",
        isLive && "border-destructive/50",
        isAvailable && !isLive && "border-success/50",
        !isAvailable && "border-warning/50",
        "hover:shadow-card-hover",
        className,
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          isLive && "bg-destructive",
          isAvailable && !isLive && "bg-success",
          !isAvailable && "bg-warning",
        )}
      />

      <div className="flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-start sm:gap-5">
        {/* Thumbnail placeholder */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted sm:w-40 sm:flex-shrink-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              {isAvailable ? (
                <Play className="h-8 w-8 text-primary/50" />
              ) : (
                <Lock className="h-6 w-6 text-muted-foreground/50" />
              )}
            </div>
          )}

          {/* Live badge */}
          {isLive && (
            <div className="badge-live absolute left-2 top-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
              AO VIVO
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3">
          <div>
            {/* Status badge */}
            <div className="mb-2">
              {isLive ? (
                <span className="badge-live">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  Ao Vivo
                </span>
              ) : isAvailable ? (
                <span className="badge-available">
                  <Play className="h-3 w-3" />
                  Disponível
                </span>
              ) : (
                <span className="badge-upcoming">
                  <Clock className="h-3 w-3" />
                  Agendada
                </span>
              )}
            </div>

            <h3 className="font-display text-base font-semibold leading-tight text-foreground sm:text-lg">
              {title}
            </h3>

            {description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formattedTime}
            </span>
            {hasMaterial && (
              <span className="flex items-center gap-1.5 text-primary">
                <FileText className="h-4 w-4" />
                Material disponível
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
            {isAvailable ? (
              <Button onClick={onWatch} size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Assistir Aula
              </Button>
            ) : (
              <Button disabled size="sm" variant="secondary" className="gap-2">
                <Lock className="h-4 w-4" />
                Disponível em breve
              </Button>
            )}

            {hasMaterial && isAvailable && (
              <Button
                onClick={onDownload}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {materialName || "Material"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
