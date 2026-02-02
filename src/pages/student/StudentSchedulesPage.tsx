import { useNavigate } from "react-router-dom";
import { CalendarRange, Link as LinkIcon, Loader2, Lock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudentSchedules } from "@/hooks/use-schedules";
import { useIsDemo } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";

export default function StudentSchedulesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: schedules, isLoading } = useStudentSchedules();
  const { data: isDemo } = useIsDemo();

  const handleOpenLink = (e: React.MouseEvent, url: string) => {
    if (isDemo) {
      e.preventDefault();
      toast({
        variant: "destructive",
        title: "Acesso Restrito",
        description: "Alunos Demonstração não podem baixar cronogramas.",
      });
    }
  };

  return (
    <DashboardLayout
      userName="Aluno"
      userEmail=""
      onLogout={() => navigate("/")}
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">
            📅 Meus Cronogramas
          </h1>
          <p className="text-muted-foreground">
            Acompanhe as datas importantes das suas turmas.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : schedules?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            Nenhum cronograma disponível para suas turmas.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schedules?.map((item: any) => (
              <Card
                key={item.id}
                className="hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <CalendarRange className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium leading-none">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.class_groups?.name}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-2"
                    variant={isDemo ? "secondary" : "outline"}
                    asChild={!isDemo}
                    onClick={(e) => handleOpenLink(e, item.file_url)}
                  >
                    {isDemo ? (
                      <span className="cursor-not-allowed">
                        <Lock className="mr-2 h-4 w-4" /> Acesso Bloqueado
                      </span>
                    ) : (
                      <a href={item.file_url} target="_blank" rel="noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4" /> Visualizar Arquivo
                      </a>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
