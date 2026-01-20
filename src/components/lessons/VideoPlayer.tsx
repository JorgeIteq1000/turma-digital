import { Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  youtubeUrl?: string;
  isLocked?: boolean;
  lockedMessage?: string;
  className?: string;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export function VideoPlayer({
  youtubeUrl,
  isLocked = false,
  lockedMessage = "Esta aula ainda não está disponível",
  className,
}: VideoPlayerProps) {
  const videoId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;

  if (isLocked) {
    return (
      <div className={cn("video-container", className)}>
        <div className="video-locked">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Aula Bloqueada
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {lockedMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className={cn("video-container", className)}>
        <div className="video-locked">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Vídeo Indisponível
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                O link do vídeo é inválido ou não está disponível
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("video-container", className)}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="Video Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
