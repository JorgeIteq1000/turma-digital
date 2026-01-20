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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useCourse, useCreateCourse, useUpdateCourse } from "@/hooks/use-courses";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional(),
  thumbnail_url: z.string().url("URL inválida").optional().or(z.literal("")),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: string | null;
}

export function CourseFormDialog({
  open,
  onOpenChange,
  courseId,
}: CourseFormDialogProps) {
  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId || undefined);
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const isEditing = !!courseId;
  const isLoading = createCourse.isPending || updateCourse.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      thumbnail_url: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (course) {
      form.reset({
        name: course.name,
        description: course.description || "",
        thumbnail_url: course.thumbnail_url || "",
        is_active: course.is_active,
      });
    } else if (!courseId) {
      form.reset({
        name: "",
        description: "",
        thumbnail_url: "",
        is_active: true,
      });
    }
  }, [course, courseId, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && courseId) {
        await updateCourse.mutateAsync({
          id: courseId,
          name: data.name,
          is_active: data.is_active,
          thumbnail_url: data.thumbnail_url || null,
          description: data.description || null,
        });
      } else {
        await createCourse.mutateAsync({
          name: data.name,
          is_active: data.is_active,
          thumbnail_url: data.thumbnail_url || null,
          description: data.description || null,
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
            {isEditing ? "Editar Curso" : "Novo Curso"}
          </DialogTitle>
        </DialogHeader>

        {isLoadingCourse && isEditing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Curso *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Direito Civil" {...field} />
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
                        placeholder="Descreva o curso..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://exemplo.com/imagem.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Curso Ativo</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Cursos inativos não aparecem para alunos.
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
                  {isEditing ? "Salvar" : "Criar Curso"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
