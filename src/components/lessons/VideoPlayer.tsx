import { Lock, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";

interface VideoPlayerProps {
  youtubeUrl: string;
  isLocked?: boolean;
  className?: string;
  onPlay?: () => void;
}

export interface VideoPlayerRef {
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ youtubeUrl, isLocked = false, className, onPlay }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);

    // Manteiga a ref para não quebrar a página pai, mas com funcionalidades limitadas temporariamente
    useImperativeHandle(ref, () => ({
      getCurrentTime: () => 0, // Fallback enquanto usamos iframe nativo
      seekTo: () => console.log("Seek desabilitado no modo nativo"),
    }));

    // Extração robusta do ID
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

    // Reset ao trocar URL
    useEffect(() => {
      setIsPlaying(false);
      setIframeUrl(null);
    }, [youtubeUrl]);

    const handlePlay = () => {
      if (!videoId) return;

      // Montamos a URL nativa de embed do YouTube com Autoplay
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

      setIframeUrl(embedUrl);
      setIsPlaying(true);
      if (onPlay) onPlay();
    };

    if (isLocked) {
      return (
        <div
          className={cn(
            "relative aspect-video w-full overflow-hidden bg-slate-900 rounded-xl",
            className,
          )}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 text-white backdrop-blur-sm z-10">
            <div className="rounded-full bg-white/10 p-4">
              <Lock className="h-8 w-8" />
            </div>
            <p className="font-medium">Conteúdo Bloqueado</p>
          </div>
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              className="absolute inset-0 h-full w-full object-cover opacity-50"
              alt="Bloqueado"
            />
          )}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden bg-black rounded-xl shadow-lg",
          className,
        )}
      >
        {/* MODO NATIVO: Se estiver tocando, mostra o IFRAME direto */}
        {isPlaying && iframeUrl ? (
          <iframe
            src={iframeUrl}
            className="absolute inset-0 w-full h-full"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          // MODO CAPA: Imagem estática com botão de play
          <div
            className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-cover bg-center"
            style={{
              backgroundImage: thumbnailUrl
                ? `url(${thumbnailUrl})`
                : undefined,
              backgroundColor: "#1e293b",
            }}
            onClick={handlePlay}
          >
            <div className="absolute inset-0 bg-black/40 transition-colors hover:bg-black/20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-xl transition-transform hover:scale-110">
              <Play className="ml-2 h-10 w-10 fill-white text-white" />
            </div>
          </div>
        )}
      </div>
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";
