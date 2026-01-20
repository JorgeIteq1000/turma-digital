import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, BookOpen } from "lucide-react";
import { useStudent, useUpdateStudentEnrollments } from "@/hooks/use-students";
import { useClassGroups } from "@/hooks/use-class-groups";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StudentEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId?: string | null;
}

export function StudentEnrollmentDialog({
  open,
  onOpenChange,
  studentId,
}: StudentEnrollmentDialogProps) {
  const { data: student, isLoading: isLoadingStudent } = useStudent(studentId || undefined);
  const { data: classGroups, isLoading: isLoadingClassGroups } = useClassGroups();
  const updateEnrollments = useUpdateStudentEnrollments();

  const [selectedClassGroups, setSelectedClassGroups] = useState<string[]>([]);

  const isLoading = isLoadingStudent || isLoadingClassGroups;
  const isSaving = updateEnrollments.isPending;

  useEffect(() => {
    if (student?.class_enrollments) {
      setSelectedClassGroups(
        student.class_enrollments.map((e) => e.class_group_id)
      );
    } else {
      setSelectedClassGroups([]);
    }
  }, [student]);

  const handleToggle = (classGroupId: string) => {
    setSelectedClassGroups((prev) =>
      prev.includes(classGroupId)
        ? prev.filter((id) => id !== classGroupId)
        : [...prev, classGroupId]
    );
  };

  const handleSave = async () => {
    if (!studentId) return;

    try {
      await updateEnrollments.mutateAsync({
        userId: studentId,
        classGroupIds: selectedClassGroups,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Group class groups by course
  const groupedClassGroups = classGroups?.reduce(
    (acc, classGroup) => {
      const courseName = classGroup.courses?.name || "Sem Curso";
      if (!acc[courseName]) {
        acc[courseName] = [];
      }
      acc[courseName].push(classGroup);
      return acc;
    },
    {} as Record<string, typeof classGroups>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Matrículas de {student?.full_name || "Aluno"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione as turmas em que o aluno está matriculado:
            </p>

            <ScrollArea className="h-[300px] rounded-md border p-4">
              {Object.keys(groupedClassGroups || {}).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mb-2" />
                  <p>Nenhuma turma disponível.</p>
                  <p className="text-sm">Crie turmas primeiro.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedClassGroups || {}).map(
                    ([courseName, groups]) => (
                      <div key={courseName} className="space-y-2">
                        <h4 className="font-medium text-sm text-foreground">
                          {courseName}
                        </h4>
                        <div className="space-y-2 pl-2">
                          {groups?.map((classGroup) => (
                            <div
                              key={classGroup.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={classGroup.id}
                                checked={selectedClassGroups.includes(
                                  classGroup.id
                                )}
                                onCheckedChange={() =>
                                  handleToggle(classGroup.id)
                                }
                              />
                              <label
                                htmlFor={classGroup.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {classGroup.name}
                                {!classGroup.is_active && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    (Inativa)
                                  </span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-muted-foreground">
                {selectedClassGroups.length} turma(s) selecionada(s)
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
