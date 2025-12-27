import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Teacher Pages
import TeacherLayout from "./components/layout/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import LessonsList from "./pages/teacher/LessonsList";
import CreateLesson from "./pages/teacher/CreateLesson";
import AssessmentsList from "./pages/teacher/AssessmentsList";
import Analytics from "./pages/teacher/Analytics";
import Gradebook from "./pages/teacher/Gradebook";
import Schedule from "./pages/teacher/Schedule";
import Settings from "./pages/teacher/Settings";
import ViewLesson from "./pages/teacher/ViewLesson";
import EditLesson from "./pages/teacher/EditLesson";
import CreateAssessment from "./pages/teacher/CreateAssessment";
import ViewAssessment from "./pages/teacher/ViewAssessment";
import EditAssessment from "./pages/teacher/EditAssessment";

import Students from "./pages/teacher/Students";

// Student Pages
import StudentLayout from "./components/layout/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAssignment from "./pages/student/StudentAssignment";
import AITutor from "./pages/student/AITutor";
import StudentGrade from "./pages/student/StudentGrade";
import StudentProfile from "./pages/student/StudentProfile";
import StudyPlan from "./pages/student/StudyPlan";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="lessons" element={<LessonsList />} />
        <Route path="lessons/create" element={<CreateLesson />} />
        <Route path="lessons/:id" element={<ViewLesson />} />
        <Route path="lessons/edit/:id" element={<EditLesson />} />
        <Route path="assessments" element={<AssessmentsList />} />
        <Route path="assessments/create" element={<CreateAssessment />} />
        <Route path="assessments/:id" element={<ViewAssessment />} />
        <Route path="assessments/:id/edit" element={<EditAssessment />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="gradebook" element={<Gradebook />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="settings" element={<Settings />} />
        <Route path="students" element={<Students />} />
      </Route>

      {/* Placeholder routes for Student and Admin */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="assignments" element={<StudentAssignment />} />
        <Route path="assignments/:id" element={<StudentAssignment />} />
        <Route path="tutor" element={<AITutor />} />
        <Route path="grades" element={<StudentGrade />} />
        <Route path="study-plan" element={<StudyPlan />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
