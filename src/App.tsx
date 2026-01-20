import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import StudentDashboard from "./pages/student/Dashboard";
import LessonView from "./pages/student/LessonView";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CoursesPage from "./pages/admin/CoursesPage";
import ClassGroupsPage from "./pages/admin/ClassGroupsPage";
import LessonsPage from "./pages/admin/LessonsPage";
import StudentsPage from "./pages/admin/StudentsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/lesson/:lessonId" element={<LessonView />} />
          <Route path="/upcoming" element={<StudentDashboard />} />
          <Route path="/recorded" element={<StudentDashboard />} />
          <Route path="/materials" element={<StudentDashboard />} />
          <Route path="/profile" element={<StudentDashboard />} />
          <Route path="/class/:classId" element={<StudentDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<CoursesPage />} />
          <Route path="/admin/classes" element={<ClassGroupsPage />} />
          <Route path="/admin/lessons" element={<LessonsPage />} />
          <Route path="/admin/students" element={<StudentsPage />} />
          <Route path="/admin/reports" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
