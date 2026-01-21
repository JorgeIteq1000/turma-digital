import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";

// Páginas Públicas
import Login from "./pages/auth/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Páginas do Aluno
import StudentDashboard from "./pages/student/Dashboard"; // Renomeei para StudentDashboard para ficar claro
import LessonView from "./pages/student/LessonView";
import UpcomingLessonsPage from "./pages/student/UpcomingLessonsPage"; // <--- Novo
import RecordedLessonsPage from "./pages/student/RecordedLessonsPage"; // <--- Novo
import MaterialsPage from "./pages/student/MaterialsPage"; // <--- Novo
import ProfilePage from "./pages/student/ProfilePage"; // <--- Novo

// Páginas do Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentsPage from "./pages/admin/StudentsPage";
import CoursesPage from "./pages/admin/CoursesPage";
import ClassGroupsPage from "./pages/admin/ClassGroupsPage";
import LessonsPage from "./pages/admin/LessonsPage";
import ClassDetailsPage from "./pages/student/ClassDetailsPage"; // <--- Importe Novo
import ReportsPage from "./pages/admin/ReportsPage"; // Importe no topo

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- ROTAS PÚBLICAS --- */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          {/* --- ÁREA DO ALUNO (Protegida) --- */}
          {/* Este Route envolve todos os filhos com a proteção de Login */}
          <Route element={<RequireAuth requiredRole="student" />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/lessons/:id" element={<LessonView />} />
            <Route path="/classes/:id" element={<ClassDetailsPage />} />
            {/* Novas Rotas Conectadas ao Sidebar 👇 */}
            <Route path="/upcoming" element={<UpcomingLessonsPage />} />
            <Route path="/recorded" element={<RecordedLessonsPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* --- ÁREA DO ADMIN (Protegida + Role Admin) --- */}
          <Route element={<RequireAuth requiredRole="admin" />}>
            {/* Redireciona /admin para o dashboard automaticamente */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentsPage />} />
            <Route path="/admin/courses" element={<CoursesPage />} />
            <Route path="/admin/classes" element={<ClassGroupsPage />} />
            <Route path="/admin/lessons" element={<LessonsPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
          </Route>

          {/* Fallback para 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
