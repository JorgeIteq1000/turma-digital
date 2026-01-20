import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth"; // <--- Importe o Guard

// Pages
import Login from "./pages/auth/Login";
import Index from "./pages/Index"; // Landing Page
import Dashboard from "./pages/student/Dashboard";
import LessonView from "./pages/student/LessonView";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentsPage from "./pages/admin/StudentsPage";
import CoursesPage from "./pages/admin/CoursesPage";
import ClassGroupsPage from "./pages/admin/ClassGroupsPage";
import LessonsPage from "./pages/admin/LessonsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          {/* Rotas de Aluno (Protegidas) */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/lessons/:id"
            element={
              <RequireAuth>
                <LessonView />
              </RequireAuth>
            }
          />

          {/* Rotas de Admin (Protegidas + Apenas Admin) */}
          <Route
            path="/admin"
            element={
              <RequireAuth requiredRole="admin">
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/students"
            element={
              <RequireAuth requiredRole="admin">
                <StudentsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <RequireAuth requiredRole="admin">
                <CoursesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/classes"
            element={
              <RequireAuth requiredRole="admin">
                <ClassGroupsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/lessons"
            element={
              <RequireAuth requiredRole="admin">
                <LessonsPage />
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
