import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useClassGroup, useCreateClassGroup, useUpdateClassGroup } from "@/hooks/use-class-groups";
import { useCourses } from "@/hooks/use-courses";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional(),
  course_id: z.string().min(1, "Selecione um curso"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface ClassGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classGroupId?: string | null;
}

export function ClassGroupFormDialog({
  open,
  onOpenChange,
  classGroupId,
}: ClassGroupFormDialogProps) {
  const { data: classGroup, isLoading: isLoadingClassGroup } = useClassGroup(
    classGroupId || undefined
  );
  const { data: courses } = useCourses();
  const createClassGroup = useCreateClassGroup();
  const updateClassGroup = useUpdateClassGroup();

  const isEditing = !!classGroupId;
  const isLoading = createClassGroup.isPending || updateClassGroup.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      course_id: "",
      start_date: "",
      end_date: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (classGroup) {
      form.reset({
        name: classGroup.name,
        description: classGroup.description || "",
        course_id: classGroup.course_id,
        start_date: classGroup.start_date || "",
        end_date: classGroup.end_date || "",
        is_active: classGroup.is_active,
      });
    } else if (!classGroupId) {
      form.reset({
        name: "",
        description: "",
        course_id: "",
        start_date: "",
        end_date: "",
        is_active: true,
      });
    }
  }, [classGroup, classGroupId, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && classGroupId) {
        await updateClassGroup.mutateAsync({
          id: classGroupId,
          name: data.name,
          course_id: data.course_id,
          is_active: data.is_active,
          description: data.description || null,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
        });
      } else {
        await createClassGroup.mutateAsync({
          name: data.name,
          course_id: data.course_id,
          is_active: data.is_active,
          description: data.description || null,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled in hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Turma" : "Nova Turma"}
          </DialogTitle>
        </DialogHeader>

        {isLoadingClassGroup && isEditing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Curso *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um curso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Turma *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Turma A - 2024.1" {...field} />
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
                        placeholder="Descreva a turma..."
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
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Início</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Fim</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Turma Ativa</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Turmas inativas não aparecem para alunos.
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
                  {isEditing ? "Salvar" : "Criar Turma"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
