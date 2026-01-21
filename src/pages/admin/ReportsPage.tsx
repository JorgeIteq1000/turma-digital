import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useActivityLogs } from "@/hooks/use-dashboard";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export default function ReportsPage() {
  const navigate = useNavigate();
  const { data: logs, isLoading } = useActivityLogs();
  const [search, setSearch] = useState("");

  // Filtro local simples
  const filteredLogs =
    logs?.filter(
      (log: any) =>
        log.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        log.lessons?.title?.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  return (
    <DashboardLayout
      isAdmin
      userName="Admin"
      userEmail="admin@escola.com"
      onLogout={() => navigate("/")}
    >
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Monitoramento em Tempo Real
            </h1>
            <p className="text-muted-foreground">
              Veja quem está assistindo às aulas neste exato momento.
            </p>
          </div>

          {/* Barra de Busca */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filtrar por aluno ou aula..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela de Logs */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Aluno</TableHead>
                <TableHead>O que está assistindo?</TableHead>
                <TableHead className="hidden md:table-cell">
                  Turma / Curso
                </TableHead>
                <TableHead className="text-right">Quando</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Carregando acessos...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum acesso registrado recentemente.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log: any) => {
                  const initials =
                    log.profiles?.full_name?.substring(0, 2).toUpperCase() ||
                    "AL";
                  const isRecent =
                    new Date(log.viewed_at).getTime() >
                    Date.now() - 1000 * 60 * 5; // 5 min

                  return (
                    <TableRow key={log.id} className="group">
                      {/* Coluna Aluno */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarImage src={log.profiles?.avatar_url} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {log.profiles?.full_name || "Desconhecido"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {log.profiles?.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Coluna Aula */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm group-hover:text-primary transition-colors">
                            {log.lessons?.title || "Aula Removida"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Coluna Turma (Simplificada) */}
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className="w-fit text-[10px] font-normal"
                          >
                            {log.lessons?.class_groups?.name || "Turma Geral"}
                          </Badge>
                          {/* Removemos a linha do curso que causava o erro 400 */}
                        </div>
                      </TableCell>

                      {/* Coluna Tempo */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isRecent && (
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(log.viewed_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
