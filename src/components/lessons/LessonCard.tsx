import { Calendar, Play, Lock, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  isAvailable: boolean;
  hasMaterial: boolean;
  materialUrl?: string | null; // <--- Nova prop adicionada
  onWatch: () => void;
  className?: string;
}

export function LessonCard({
  title,
  description,
  scheduledAt,
  isAvailable,
  hasMaterial,
  materialUrl,
  onWatch,
  className,
}: LessonCardProps) {
  // --- Função de Segurança para Links ---
  const getSafeUrl = (url: string | null | undefined) => {
    if (!url) return "#";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-display font-semibold leading-none group-hover:text-primary">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
            isAvailable
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-muted bg-muted text-muted-foreground",
          )}
        >
          {isAvailable ? (
            <Play className="h-4 w-4 fill-current" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {format(scheduledAt, "dd MMM, HH:mm", { locale: ptBR })}
          </span>
          {hasMaterial && (
            <span className="flex items-center gap-1.5 text-primary">
              <FileText className="h-3.5 w-3.5" />
              Material
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {/* Botão de Material (Só aparece se tiver link) */}
          {hasMaterial && materialUrl && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              title="Baixar Material"
              asChild
            >
              <a
                href={getSafeUrl(materialUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}

          {/* Botão de Assistir */}
          <Button
            size="sm"
            variant={isAvailable ? "default" : "secondary"}
            className="h-8 px-3 text-xs"
            onClick={onWatch}
            disabled={!isAvailable}
          >
            {isAvailable ? "Assistir" : "Em breve"}
          </Button>
        </div>
      </div>
    </div>
  );
}
