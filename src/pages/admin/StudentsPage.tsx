import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Users, Search, BookOpen, Clock, Trash2 } from "lucide-react"; // <--- Importei Trash2
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudents, useDeleteStudent } from "@/hooks/use-students";
import { StudentEnrollmentDialog } from "@/components/admin/StudentEnrollmentDialog";
import { StudentFormDialog } from "@/components/admin/StudentFormDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // <--- Importei Tooltip

export default function StudentsPage() {
  const navigate = useNavigate();
  const { data: students, isLoading } = useStudents();

  const [searchQuery, setSearchQuery] = useState("");
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);

  const deleteStudent = useDeleteStudent();

  const handleLogout = () => {
    navigate("/");
  };

  const filteredStudents = students?.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleManageEnrollments = (studentId: string) => {
    setSelectedStudentId(studentId);
    setEnrollmentDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEnrollmentDialogOpen(false);
    setSelectedStudentId(null);
  };

  // Helper para calcular expiração (Opcional, mas útil)
  const getDemoExpiration = (createdAt: string, hours: number) => {
    const created = new Date(createdAt);
    const expires = new Date(created.getTime() + hours * 60 * 60 * 1000);
    return expires;
  };

  const handleDeleteClick = (student: { id: string; full_name: string }) => {
    setStudentToDelete({ id: student.id, name: student.full_name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteStudent.mutate(studentToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setStudentToDelete(null);
        },
      });
    }
  };

  return (
    <DashboardLayout
      isAdmin
      userName="Admin"
      userEmail="admin@faculdade.edu.br"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header e Search mantidos igual ao original... */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Alunos
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie os alunos e suas matrículas nas turmas.
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar alunos por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Turmas</TableHead>
                <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeletons mantidos...
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredStudents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p>Nenhum aluno encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents?.map((student) => {
                  // Lógica para badge de Demo
                  const isDemo = student.is_demo;
                  const demoHours = student.demo_hours;

                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-medium">
                            {student.full_name}
                          </span>

                          {/* BADGE DEMO */}
                          {isDemo && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge
                                    variant="outline"
                                    className="border-orange-500 text-orange-600 bg-orange-50 gap-1 px-2 py-0 h-5 text-[10px] uppercase font-bold tracking-wide"
                                  >
                                    <Clock className="h-3 w-3" />
                                    DEMO
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Acesso temporário: {demoHours} horas</p>
                                  <p className="text-xs text-muted-foreground">
                                    Expira em:{" "}
                                    {format(
                                      getDemoExpiration(
                                        student.created_at,
                                        demoHours || 24,
                                      ),
                                      "dd/MM/yyyy HH:mm",
                                    )}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {student.email}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary">
                            {student.class_enrollments?.length || 0} turma(s)
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {format(new Date(student.created_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageEnrollments(student.id)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Matrículas
                        </Button>
                        <Button
                          variant="ghost" // Mudado para ghost para não poluir visualmente, ou manter outline e por um ícone de deletar
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(student)}
                          title="Excluir Aluno"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      <StudentEnrollmentDialog
        open={enrollmentDialogOpen}
        onOpenChange={handleDialogClose}
        studentId={selectedStudentId}
      />

      <StudentFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o aluno
              <span className="font-bold text-foreground"> {studentToDelete?.name} </span>
              e removerá seus dados de acesso e histórico de aulas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteStudent.isPending}
            >
              {deleteStudent.isPending ? "Excluindo..." : "Sim, excluir aluno"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
