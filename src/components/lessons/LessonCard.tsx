import { Calendar, Clock, Play, Lock, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsDemo } from "@/hooks/use-user-role"; // <--- Importado
import { useToast } from "@/hooks/use-toast"; // <--- Importado

interface LessonCardProps {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  isAvailable: boolean;
  isLive?: boolean;
  hasMaterial?: boolean;
  materialName?: string;
  materialUrl?: string;
  thumbnailUrl?: string;
  onWatch?: () => void;
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
  materialUrl,
  thumbnailUrl,
  onWatch,
  className,
}: LessonCardProps) {
  const formattedDate = format(scheduledAt, "dd 'de' MMMM", { locale: ptBR });
  const formattedTime = format(scheduledAt, "HH:mm");

  const { data: isDemo } = useIsDemo(); // Verifica se é demo
  const { toast } = useToast();

  // Função para garantir links seguros (https)
  const getSafeUrl = (url: string | null | undefined) => {
    if (!url) return "#";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  // Trava de Download
  const handleDownloadClick = (e: React.MouseEvent) => {
    if (isDemo) {
      e.preventDefault();
      console.log("🚫 Download bloqueado no card: Usuário Demo");
      toast({
        variant: "destructive",
        title: "Acesso Restrito",
        description: "Download somente para Alunos Matriculados.",
      });
    }
  };

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
      {/* Indicador lateral de Status */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          isLive && "bg-destructive",
          isAvailable && !isLive && "bg-success",
          !isAvailable && "bg-warning",
        )}
      />

      <div className="flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-start sm:gap-5">
        {/* ÁREA DA THUMBNAIL */}
        <div
          className={cn(
            "relative aspect-video w-full overflow-hidden rounded-lg bg-muted sm:w-40 sm:flex-shrink-0",
            isAvailable && "cursor-pointer hover:opacity-90 transition-opacity",
          )}
          onClick={isAvailable ? onWatch : undefined}
        >
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

          {isLive && (
            <div className="badge-live absolute left-2 top-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
              AO VIVO
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex flex-1 flex-col gap-3">
          <div>
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

            {/* Botão de Material com Trava Demo */}
            {hasMaterial && isAvailable && materialUrl && (
              <Button
                asChild={!isDemo}
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={isDemo ? handleDownloadClick : undefined}
              >
                {isDemo ? (
                  <span className="cursor-pointer">
                    <Download className="h-4 w-4" />
                    {materialName || "Material"}
                  </span>
                ) : (
                  <a
                    href={getSafeUrl(materialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                    {materialName || "Material"}
                  </a>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
