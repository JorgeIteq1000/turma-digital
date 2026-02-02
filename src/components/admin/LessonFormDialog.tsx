import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, FileText, Check, ChevronsUpDown, X } from "lucide-react";
import { useLesson, useCreateLesson, useUpdateLesson } from "@/hooks/use-lessons";
import { useClassGroups } from "@/hooks/use-class-groups";
import { toast } from "sonner"; // Importado diretamente para usar no onSubmit múltiplo

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().max(1000, "Descrição muito longa").optional(),
  // class_group_id usado na edição (single)
  class_group_id: z.string().optional(),
  // class_group_ids usado na criação (multi)
  class_group_ids: z.array(z.string()).optional(),
  scheduled_at: z.string().min(1, "Data e hora são obrigatórios"),
  youtube_url: z.string().url("URL do YouTube inválida").refine(
    (url) => url.includes("youtube.com") || url.includes("youtu.be"),
    "URL deve ser do YouTube"
  ),
  material_url: z.string().url("URL inválida").optional().or(z.literal("")),
  material_name: z.string().max(100, "Nome muito longo").optional(),
  order_index: z.number().int().min(0),
  is_published: z.boolean(),
}).refine((data) => {
  // Validação customizada: precisa de um ID se for edição (implícito pelo uso) ou array se for criação
  // Mas como não temos o contexto "isEditing" aqui dentro facilmente sem currying,
  // vamos validar no onSubmit ou deixar o Zod mais permissivo e garantir na lógica.
  // Vamos simplificar: se class_group_id não existir, class_group_ids deve ter items.
  if (!data.class_group_id && (!data.class_group_ids || data.class_group_ids.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Selecione pelo menos uma turma",
  path: ["class_group_ids"], // Aponta o erro para o campo de array
});

type FormData = z.infer<typeof formSchema>;

interface LessonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId?: string | null;
}

export function LessonFormDialog({
  open,
  onOpenChange,
  lessonId,
}: LessonFormDialogProps) {
  const { data: lesson, isLoading: isLoadingLesson } = useLesson(lessonId || undefined);
  const { data: classGroups } = useClassGroups();
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const isEditing = !!lessonId;
  const isLoading = createLesson.isPending || updateLesson.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      class_group_id: "",
      class_group_ids: [],
      scheduled_at: "",
      youtube_url: "",
      material_url: "",
      material_name: "",
      order_index: 0,
      is_published: true,
    },
  });

  useEffect(() => {
    if (lesson && isEditing) {
      const scheduledDate = new Date(lesson.scheduled_at);
      // Ajuste fuso horário simples (local) -> slice para datetime-local
      // Nota: new Date(iso) converte para local do browser.
      // toISOString() converte para UTC. Para input datetime-local, precisamos de YYYY-MM-DDTHH:mm local.
      // Hack simples:
      const localDatetime = new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      form.reset({
        title: lesson.title,
        description: lesson.description || "",
        class_group_id: lesson.class_group_id,
        class_group_ids: [], // Na edição, array vazio (usa o single)
        scheduled_at: localDatetime,
        youtube_url: lesson.youtube_url,
        material_url: lesson.material_url || "",
        material_name: lesson.material_name || "",
        order_index: lesson.order_index,
        is_published: lesson.is_published,
      });
    } else if (!open) {
      // Reset completo ao fechar
      form.reset({
        title: "",
        description: "",
        class_group_id: "",
        class_group_ids: [],
        scheduled_at: "",
        youtube_url: "",
        material_url: "",
        material_name: "",
        order_index: 0,
        is_published: true,
      });
    }
  }, [lesson, lessonId, form, open, isEditing]);

  const onSubmit = async (data: FormData) => {
    try {
      const scheduled = new Date(data.scheduled_at).toISOString();

      if (isEditing && lessonId) {
        // Single Update
        await updateLesson.mutateAsync({
          id: lessonId,
          title: data.title,
          class_group_id: data.class_group_id!, // Garantido pela lógica
          youtube_url: data.youtube_url,
          order_index: data.order_index,
          is_published: data.is_published,
          scheduled_at: scheduled,
          description: data.description || null,
          material_url: data.material_url || null,
          material_name: data.material_name || null,
        });
      } else {
        // Multi Create
        const targetIds = data.class_group_ids || [];
        if (targetIds.length === 0) {
          form.setError("class_group_ids", { message: "Selecione pelo menos uma turma" });
          return;
        }

        // Cria uma promessa para cada turma
        const promises = targetIds.map(groupId => 
          createLesson.mutateAsync({
            title: data.title,
            class_group_id: groupId,
            youtube_url: data.youtube_url,
            order_index: data.order_index,
            is_published: data.is_published,
            scheduled_at: scheduled,
            description: data.description || null,
            material_url: data.material_url || null,
            material_name: data.material_name || null,
          })
        );

        await Promise.all(promises);
        toast.success(`${targetIds.length} aula(s) criada(s) com sucesso!`);
      }
      onOpenChange(false);
    } catch (error) {
       // Erro tratado nos hooks individuais, mas o Promise.all falha se um falhar.
       console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Aula" : "Nova Aula"}
          </DialogTitle>
        </DialogHeader>

        {isLoadingLesson && isEditing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* SELEÇÃO DE TURMA: Lógica Condicional */}
              {isEditing ? (
                // MODO EDIÇÃO: Select Simples (Não permite mudar para várias)
                <FormField
                  control={form.control}
                  name="class_group_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turma *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma turma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classGroups?.map((classGroup) => (
                            <SelectItem key={classGroup.id} value={classGroup.id}>
                              {classGroup.name} - {classGroup.courses?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                // MODO CRIAÇÃO: MultiSelect com Checkboxes
                <FormField
                  control={form.control}
                  name="class_group_ids"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Turmas *</FormLabel>
                      <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value?.length && "text-muted-foreground"
                              )}
                            >
                              {field.value?.length
                                ? `${field.value.length} turma(s) selecionada(s)`
                                : "Selecione as turmas"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar turma..." />
                            <CommandList>
                              <CommandEmpty>Nenhuma turma encontrada.</CommandEmpty>
                              <CommandGroup>
                                {classGroups?.map((classGroup) => (
                                  <CommandItem
                                    value={classGroup.name + " " + classGroup.courses?.name} // Busca por texto
                                    key={classGroup.id}
                                    onSelect={() => {
                                      const current = new Set(field.value || []);
                                      if (current.has(classGroup.id)) {
                                        current.delete(classGroup.id);
                                      } else {
                                        current.add(classGroup.id);
                                      }
                                      field.onChange(Array.from(current));
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value?.includes(classGroup.id)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{classGroup.name}</span>
                                      <span className="text-xs text-muted-foreground">{classGroup.courses?.name}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Você pode selecionar múltiplas turmas para criar cópias desta aula.
                      </FormDescription>
                      
                      {/* Mostra as turmas selecionadas como Badges */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value?.map((id) => {
                          const group = classGroups?.find(g => g.id === id);
                          return (
                            <Badge key={id} variant="secondary" className="pl-2 pr-1 py-1">
                              {group?.name}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  const current = field.value?.filter(curr => curr !== id);
                                  field.onChange(current);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Aula *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Introdução ao Direito Civil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o conteúdo da aula..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduled_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order_index"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordem</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* YouTube Section */}
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Video className="h-4 w-4 text-red-500" />
                  Vídeo do YouTube
                </div>
                <FormField
                  control={form.control}
                  name="youtube_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Vídeo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Cole o link do vídeo do YouTube aqui.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Material PDF Section */}
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-primary" />
                  Material de Apoio (PDF)
                </div>
                <FormField
                  control={form.control}
                  name="material_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Material</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Slides da Aula 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="material_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do PDF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://exemplo.com/material.pdf"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Cole o link direto para o arquivo PDF.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Aula Publicada</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Aulas não publicadas ficam como rascunho.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Salvar" : "Criar Aulas"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
