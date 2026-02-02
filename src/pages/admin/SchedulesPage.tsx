import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  Trash2,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useClassGroups } from "@/hooks/use-class-groups";
import {
  useSchedules,
  useCreateSchedule,
  useDeleteSchedule,
} from "@/hooks/use-schedules";

export default function SchedulesPage() {
  const navigate = useNavigate();
  const { data: schedules, isLoading: loadingSchedules } = useSchedules();
  const { data: classes } = useClassGroups();

  const { mutate: createSchedule, isPending: creating } = useCreateSchedule();
  const { mutate: deleteSchedule, isPending: deleting } = useDeleteSchedule();

  const [isOpen, setIsOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    file_url: "",
    class_group_id: "",
  });

  const handleCreate = () => {
    if (
      !newSchedule.title ||
      !newSchedule.file_url ||
      !newSchedule.class_group_id
    )
      return;
    createSchedule(newSchedule, {
      onSuccess: () => {
        setIsOpen(false);
        setNewSchedule({ title: "", file_url: "", class_group_id: "" });
      },
    });
  };

  return (
    <DashboardLayout
      isAdmin
      userName="Admin"
      userEmail="admin@edu.com"
      onLogout={() => navigate("/")}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Cronogramas</h1>
            <p className="text-muted-foreground">
              Gerencie os arquivos de cronograma das turmas.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Cronograma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Cronograma</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título do Arquivo</Label>
                  <Input
                    placeholder="Ex: Calendário 2026 - Semestre 1"
                    value={newSchedule.title}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Turma</Label>
                  <Select
                    value={newSchedule.class_group_id}
                    onValueChange={(val) =>
                      setNewSchedule({ ...newSchedule, class_group_id: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Link do Arquivo (Google Drive/PDF)</Label>
                  <Input
                    placeholder="https://drive.google.com/..."
                    value={newSchedule.file_url}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        file_url: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loadingSchedules ? (
            <div className="col-span-full flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : schedules?.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-10 border rounded-lg border-dashed">
              Nenhum cronograma cadastrado.
            </div>
          ) : (
            schedules?.map((item: any) => (
              <Card key={item.id} className="relative group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-start justify-between">
                    <span className="line-clamp-1">{item.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteSchedule(item.id)}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>{item.class_groups?.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a href={item.file_url} target="_blank" rel="noreferrer">
                      <LinkIcon className="mr-2 h-4 w-4" /> Abrir Link
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
