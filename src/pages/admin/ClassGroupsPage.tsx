import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, BookOpen, Search } from "lucide-react";
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
import { useClassGroups, useDeleteClassGroup } from "@/hooks/use-class-groups";
import { ClassGroupFormDialog } from "@/components/admin/ClassGroupFormDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ClassGroupsPage() {
  const navigate = useNavigate();
  const { data: classGroups, isLoading } = useClassGroups();
  const deleteClassGroup = useDeleteClassGroup();

  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingClassGroup, setEditingClassGroup] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleLogout = () => {
    navigate("/");
  };

  const filteredClassGroups = classGroups?.filter(
    (classGroup) =>
      classGroup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classGroup.courses?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (id: string) => {
    setEditingClassGroup(id);
    setFormDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteClassGroup.mutateAsync(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleFormClose = () => {
    setFormDialogOpen(false);
    setEditingClassGroup(null);
  };

  return (
    <DashboardLayout
      isAdmin
      userName="Admin"
      userEmail="admin@faculdade.edu.br"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Turmas
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie as turmas de cada curso.
            </p>
          </div>
          <Button onClick={() => setFormDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar turmas..."
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
                <TableHead className="hidden md:table-cell">Curso</TableHead>
                <TableHead className="hidden sm:table-cell">Período</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredClassGroups?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-8 w-8" />
                      <p>Nenhuma turma encontrada.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClassGroups?.map((classGroup) => (
                  <TableRow key={classGroup.id}>
                    <TableCell className="font-medium">{classGroup.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {classGroup.courses?.name || "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {classGroup.start_date && classGroup.end_date
                        ? `${format(new Date(classGroup.start_date), "dd/MM/yy", {
                            locale: ptBR,
                          })} - ${format(new Date(classGroup.end_date), "dd/MM/yy", {
                            locale: ptBR,
                          })}`
                        : "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={classGroup.is_active ? "default" : "secondary"}>
                        {classGroup.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(classGroup.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(classGroup.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Form Dialog */}
      <ClassGroupFormDialog
        open={formDialogOpen}
        onOpenChange={handleFormClose}
        classGroupId={editingClassGroup}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta turma? Esta ação não pode ser
              desfeita e também excluirá todas as aulas associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
