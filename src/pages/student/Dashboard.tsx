import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Clock, Play, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ClassGroupCard } from "@/components/dashboard/ClassGroupCard";
import { LessonCard } from "@/components/lessons/LessonCard";
import { Button } from "@/components/ui/button";
import { addDays, subHours, addHours } from "date-fns";

// Mock data - will be replaced with Supabase queries
const mockClasses = [
  {
    id: "1",
    name: "Turma A - Direito Civil",
    courseName: "Direito",
    description: "Fundamentos do Direito Civil Brasileiro",
    lessonsCount: 12,
    upcomingCount: 3,
    recordedCount: 9,
    nextLessonDate: addDays(new Date(), 2),
  },
  {
    id: "2",
    name: "Turma B - Administração",
    courseName: "Administração",
    description: "Princípios de Gestão Empresarial",
    lessonsCount: 8,
    upcomingCount: 2,
    recordedCount: 6,
    nextLessonDate: addDays(new Date(), 1),
  },
];

const mockUpcomingLessons = [
  {
    id: "1",
    title: "Introdução aos Contratos - Parte 2",
    description: "Continuação do estudo sobre contratos no direito civil",
    scheduledAt: addHours(new Date(), 26),
    isAvailable: false,
    hasMaterial: true,
    materialName: "Slides Aula 10",
  },
  {
    id: "2",
    title: "Gestão de Pessoas - Motivação",
    description: "Teorias motivacionais e sua aplicação prática",
    scheduledAt: addDays(new Date(), 3),
    isAvailable: false,
    hasMaterial: false,
  },
];

const mockRecentLessons = [
  {
    id: "3",
    title: "Introdução aos Contratos - Parte 1",
    description: "Fundamentos e tipos de contratos no direito brasileiro",
    scheduledAt: subHours(new Date(), 48),
    isAvailable: true,
    hasMaterial: true,
    materialName: "Material Complementar",
  },
  {
    id: "4",
    title: "Marketing Digital - Estratégias",
    description: "Principais estratégias de marketing para o ambiente digital",
    scheduledAt: subHours(new Date(), 72),
    isAvailable: true,
    hasMaterial: true,
    materialName: "E-book Marketing",
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const handleWatchLesson = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleDownloadMaterial = (lessonId: string) => {
    // Will implement with Supabase storage
    console.log("Download material for lesson:", lessonId);
  };

  return (
    <DashboardLayout
      userName="João Silva"
      userEmail="joao.silva@email.com"
      onLogout={handleLogout}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <section>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Olá, João! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Continue de onde você parou e acompanhe suas aulas.
          </p>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Turmas Matriculadas"
            value={2}
            icon={BookOpen}
            variant="primary"
          />
          <StatsCard
            title="Aulas Disponíveis"
            value={15}
            icon={Play}
            variant="success"
          />
          <StatsCard
            title="Próximas Aulas"
            value={5}
            icon={Calendar}
            variant="warning"
          />
          <StatsCard
            title="Horas Assistidas"
            value="24h"
            description="Este mês"
            icon={Clock}
          />
        </section>

        {/* My Classes */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Minhas Turmas
            </h2>
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockClasses.map((classGroup) => (
              <ClassGroupCard
                key={classGroup.id}
                {...classGroup}
                onClick={() => navigate(`/class/${classGroup.id}`)}
              />
            ))}
          </div>
        </section>

        {/* Upcoming Lessons */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              📅 Próximas Aulas
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/upcoming")}>
              Ver todas
            </Button>
          </div>
          <div className="space-y-3">
            {mockUpcomingLessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <LessonCard
                  {...lesson}
                  scheduledAt={lesson.scheduledAt}
                  onWatch={() => handleWatchLesson(lesson.id)}
                  onDownload={() => handleDownloadMaterial(lesson.id)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Recent Recorded Lessons */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              ▶️ Aulas Recentes
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/recorded")}>
              Ver todas
            </Button>
          </div>
          <div className="space-y-3">
            {mockRecentLessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <LessonCard
                  {...lesson}
                  scheduledAt={lesson.scheduledAt}
                  onWatch={() => handleWatchLesson(lesson.id)}
                  onDownload={() => handleDownloadMaterial(lesson.id)}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
