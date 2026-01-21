import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Trash2, Clock } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { format } from "date-fns";

interface LessonNotesProps {
  lessonId: string;
  getCurrentTime: () => number;
  onSeek: (time: number) => void;
}

export function LessonNotes({
  lessonId,
  getCurrentTime,
  onSeek,
}: LessonNotesProps) {
  const [newNote, setNewNote] = useState("");
  const { notes, isLoading, addNote, deleteNote } = useNotes(lessonId);

  // Helper para formatar segundos em mm:ss
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    // Pega o tempo ATUAL do vídeo
    const currentTime = getCurrentTime();

    addNote.mutate({
      content: newNote,
      timestamp: currentTime,
    });
    setNewNote("");
  };

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card">
      <div className="border-b p-4">
        <h3 className="font-display font-semibold flex items-center gap-2">
          📝 Meu Caderno
        </h3>
      </div>

      {/* Lista de Notas */}
      <ScrollArea className="flex-1 p-4 h-[300px]">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : notes?.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            Nenhuma anotação ainda.
            <br />
            Capture momentos importantes!
          </div>
        ) : (
          <div className="space-y-3">
            {notes?.map((note) => (
              <div
                key={note.id}
                className="group relative rounded-lg border bg-muted/30 p-3 text-sm transition-colors hover:bg-muted"
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <button
                    onClick={() => onSeek(note.timestamp)}
                    className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Clock className="h-3 w-3" />
                    {formatTime(note.timestamp)}
                  </button>
                  <button
                    onClick={() => deleteNote.mutate(note.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input de Nova Nota */}
      <div className="border-t p-3 bg-muted/10">
        <Textarea
          placeholder="Digite sua anotação..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-[80px] mb-2 resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddNote();
            }
          }}
        />
        <Button
          size="sm"
          className="w-full gap-2"
          onClick={handleAddNote}
          disabled={!newNote.trim() || addNote.isPending}
        >
          {addNote.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Salvar Anotação no Minuto Atual
        </Button>
      </div>
    </div>
  );
}
