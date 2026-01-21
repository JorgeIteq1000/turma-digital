import { Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface VideoPlayerProps {
  youtubeUrl: string;
  isLocked?: boolean;
  className?: string;
  onPlay?: () => void; // <--- Adicionamos a propriedade aqui!
}

export function VideoPlayer({
  youtubeUrl,
  isLocked = false,
  className,
  onPlay,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extrai o ID do vídeo de qualquer formato de URL do YouTube
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeId(youtubeUrl);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  const handlePlay = () => {
    setIsPlaying(true);
    if (onPlay) {
      onPlay(); // Dispara o evento para registrar a visualização
    }
  };

  // Estado Bloqueado (Cadeado)
  if (isLocked) {
    return (
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden bg-slate-900",
          className,
        )}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 text-white backdrop-blur-sm">
          <div className="rounded-full bg-white/10 p-4">
            <Lock className="h-8 w-8" />
          </div>
          <p className="font-medium">Esta aula ainda não está disponível</p>
        </div>
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
          />
        )}
      </div>
    );
  }

  // Estado Tocando (Iframe)
  if (isPlaying && videoId) {
    return (
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden bg-black",
          className,
        )}
      >
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  // Estado Inicial (Capa com Botão Play)
  return (
    <div
      className={cn(
        "group relative aspect-video w-full cursor-pointer overflow-hidden bg-slate-900",
        className,
      )}
      onClick={handlePlay}
    >
      {/* Imagem de Capa */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="Thumbnail"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          Vídeo indisponível
        </div>
      )}

      {/* Overlay Escuro */}
      <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />

      {/* Botão Play Central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-primary">
          <Play className="ml-1 h-8 w-8 fill-current" />
        </div>
      </div>
    </div>
  );
}
