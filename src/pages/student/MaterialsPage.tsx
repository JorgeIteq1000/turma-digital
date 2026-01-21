import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStudentLessons } from "@/hooks/use-lessons";
import { useState } from "react";
import { useIsDemo } from "@/hooks/use-user-role"; // <--- Importado
import { useToast } from "@/hooks/use-toast"; // <--- Importado

export default function MaterialsPage() {
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useStudentLessons();
  const { data: isDemo } = useIsDemo(); // <--- Check Demo
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const getSafeUrl = (url: string | null) => {
    if (!url) return "#";
    if (!url.startsWith("http://") && !url.startsWith("https://"))
      return `https://${url}`;
    return url;
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    if (isDemo) {
      e.preventDefault();
      console.log("🚫 Download bloqueado na página de materiais");
      toast({
        variant: "destructive",
        title: "Acesso Restrito",
        description: "Download somente para Alunos Matriculados.",
      });
    }
  };

  const materials =
    lessons?.filter((l) => l.material_url && l.material_url.trim() !== "") ||
    [];

  const filtered = materials.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.material_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout
      userName="Aluno"
      userEmail=""
      onLogout={() => navigate("/")}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">
              📚 Materiais de Apoio
            </h1>
            <p className="text-muted-foreground">
              Biblioteca de arquivos das aulas.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar material..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                Nenhum material encontrado.
              </div>
            ) : (
              filtered.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {lesson.material_name || "Material da Aula"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Aula: {lesson.title}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild={!isDemo}
                    onClick={isDemo ? handleDownloadClick : undefined}
                  >
                    {isDemo ? (
                      <span className="cursor-pointer flex items-center">
                        <Download className="mr-2 h-4 w-4" /> Baixar
                      </span>
                    ) : (
                      <a
                        href={getSafeUrl(lesson.material_url)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download className="mr-2 h-4 w-4" /> Baixar
                      </a>
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
