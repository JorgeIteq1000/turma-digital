import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Clock } from "lucide-react"; // Removi UserPlus pois o botão está fora
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger removido, pois o controle é externo
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCreateStudent } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const formSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  is_demo: z.boolean().default(false),
  demo_hours: z.coerce.number().min(1, "Mínimo de 1 hora").optional(),
});

// Interface para definir as props que o componente aceita
interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentFormDialog({
  open,
  onOpenChange,
}: StudentFormDialogProps) {
  const { mutate: createStudent, isPending } = useCreateStudent();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "mudar_senha_123",
      is_demo: false,
      demo_hours: 48,
    },
  });

  // Reseta o formulário sempre que o modal for fechado ou aberto
  useEffect(() => {
    if (open) {
      form.reset({
        full_name: "",
        email: "",
        password: "mudar_senha_123",
        is_demo: false,
        demo_hours: 48,
      });
    }
  }, [open, form]);

  const isDemo = form.watch("is_demo");

  function onSubmit(values: z.infer<typeof formSchema>) {
    createStudent(
      {
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        metadata: {
          is_demo: values.is_demo,
          demo_hours: values.is_demo ? values.demo_hours : null,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Aluno criado com sucesso!",
            description: values.is_demo
              ? `Acesso demonstração liberado por ${values.demo_hours} horas.`
              : "As credenciais foram enviadas.",
          });
          onOpenChange(false); // Fecha o modal usando a prop
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Erro ao criar aluno",
            description: error.message,
          });
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Aluno</DialogTitle>
          <DialogDescription>
            Crie uma conta para um novo estudante. Ele receberá acesso imediato.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="joao@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Inicial</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    O aluno poderá alterar esta senha depois.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SEÇÃO GANCHO COMERCIAL (DEMO) */}
            <div className="rounded-lg border p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
              <FormField
                control={form.control}
                name="is_demo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white dark:bg-slate-950">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-semibold text-primary">
                        Modo Demonstração
                      </FormLabel>
                      <FormDescription>Limitar tempo de acesso</FormDescription>
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

              {isDemo && (
                <FormField
                  control={form.control}
                  name="demo_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Tempo de Acesso (Horas)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs text-red-500 font-medium">
                        Após {field.value} horas do cadastro, o login será
                        bloqueado.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Aluno
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
