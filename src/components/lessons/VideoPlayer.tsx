import { Lock, Play, Loader2, AlertTriangle } from "lucide-react";
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
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Cast manual para evitar erros de TS
    const playerRef = useRef<any>(null);
    const Player = ReactPlayer as any;

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => playerRef.current?.getCurrentTime() || 0,
      seekTo: (seconds: number) =>
        playerRef.current?.seekTo(seconds, "seconds"),
    }));

    // LOG DE DEPURAÇÃO (Olhe no Console F12)
    useEffect(() => {
      console.log("📺 URL recebida pelo Player:", youtubeUrl);
    }, [youtubeUrl]);

    // Extrai ID e Thumbnail
    const getYoutubeId = (url: string) => {
      if (!url) return null;
      // Regex robusto para YouTube
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYoutubeId(youtubeUrl);
    const thumbnailUrl = videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : null;

    const handleStart = () => {
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

    if (hasError) {
      return (
        <div
          className={cn(
            "relative aspect-video w-full flex flex-col items-center justify-center bg-slate-900 rounded-xl text-muted-foreground gap-2",
            className,
          )}
        >
          <AlertTriangle className="h-10 w-10 text-yellow-500" />
          <p>Não foi possível carregar o vídeo.</p>
          <p className="text-xs opacity-50">URL inválida ou privada.</p>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden bg-slate-900 rounded-xl shadow-lg group",
          className,
        )}
      >
        {/* PLAYER */}
        <Player
          ref={playerRef}
          url={youtubeUrl}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls={true}
          onError={(e: any) => {
            console.error("❌ Erro no ReactPlayer:", e);
            setHasError(true);
          }}
          style={{ position: "absolute", top: 0, left: 0 }}
          config={{
            youtube: {
              playerVars: {
                showinfo: 0,
                rel: 0,
                // Autoplay desligado aqui para evitar conflito. O 'playing' do React manda.
                autoplay: 0,
              },
            },
          }}
        />

        {/* CAPA MANUAL */}
        {!isPlaying && !hasError && (
          <div
            className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-cover bg-center transition-all duration-300"
            style={{
              backgroundImage: thumbnailUrl
                ? `url(${thumbnailUrl})`
                : undefined,
              backgroundColor: "#1e293b",
            }}
            onClick={handleStart}
          >
            <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/20" />
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
