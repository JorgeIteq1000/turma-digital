import { Lock, Play, Loader2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import ReactPlayer from "react-player";

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
    // ESTADOS
    const [shouldPlay, setShouldPlay] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false); // Só vira true quando o vídeo REALMENTE começa
    const [hasError, setHasError] = useState(false);

    // REF E CAST (Bypass para TypeScript não reclamar)
    const playerRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Player = ReactPlayer as any;

    // EXPOSIÇÃO DE MÉTODOS (Isso faz o tempo funcionar!)
    useImperativeHandle(ref, () => ({
      getCurrentTime: () => playerRef.current?.getCurrentTime() || 0,
      seekTo: (seconds: number) => {
        playerRef.current?.seekTo(seconds, "seconds");
        setShouldPlay(true); // Força play ao pular
      },
    }));

    // Reset ao trocar URL
    useEffect(() => {
      setShouldPlay(false);
      setIsPlaying(false);
      setHasError(false);
    }, [youtubeUrl]);

    // Extração de ID e Thumbnail
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

    const handlePlayClick = () => {
      setShouldPlay(true);
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

    if (hasError) {
      return (
        <div className="relative aspect-video w-full flex flex-col items-center justify-center bg-slate-900 rounded-xl text-muted-foreground gap-2">
          <RefreshCcw className="h-10 w-10 text-red-500" />
          <p>Erro ao carregar player.</p>
          <button
            onClick={() => {
              setHasError(false);
              setShouldPlay(true);
            }}
            className="text-xs underline hover:text-white"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 shadow-lg group isolate",
          className,
        )}
      >
        {/* PLAYER WRAPPER (Camada 0) */}
        {/* A classe [&>div]:!h-full força o ReactPlayer a ocupar 100% */}
        <div className="absolute inset-0 z-0 [&>div]:!h-full [&>div]:!w-full [&>iframe]:!h-full [&>iframe]:!w-full">
          <Player
            ref={playerRef}
            url={youtubeUrl}
            width="100%"
            height="100%"
            playing={shouldPlay}
            controls={true}
            style={{ position: "absolute", top: 0, left: 0 }}
            // Eventos Críticos
            onReady={() => console.log("✅ Player Pronto")}
            onStart={() => {
              console.log("🎬 Vídeo Começou");
              setIsPlaying(true); // AQUI a mágica acontece: remove a capa
            }}
            onPlay={() => setIsPlaying(true)}
            onError={(e: any) => {
              console.error("❌ Erro Player:", e);
              setHasError(true);
            }}
            config={{
              youtube: {
                playerVars: {
                  showinfo: 0,
                  rel: 0,
                  modestbranding: 1,
                  origin:
                    typeof window !== "undefined"
                      ? window.location.origin
                      : undefined,
                } as any,
              } as any,
            }}
          />
        </div>

        {/* CAPA MANUAL / LOADING (Camada 1) */}
        {!isPlaying && (
          <div
            className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-cover bg-center transition-opacity duration-500"
            style={{
              backgroundImage: thumbnailUrl
                ? `url(${thumbnailUrl})`
                : undefined,
              backgroundColor: "#0f172a",
            }}
            onClick={!shouldPlay ? handlePlayClick : undefined}
          >
            <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/20" />

            <div className="relative z-30 flex flex-col items-center gap-3">
              {shouldPlay ? (
                // Estado de Carregamento (Clicou mas não começou ainda)
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-white" />
                </>
              ) : (
                // Estado Inicial (Botão Play)
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-xl transition-transform hover:scale-110">
                  <Play className="ml-2 h-10 w-10 fill-white text-white" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";
