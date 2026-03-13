import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import QuestionPapers from "./pages/admin/QuestionPapers";
import Sessions from "./pages/admin/Sessions";
import Monitoring from "./pages/admin/Monitoring";
import TakeExam from "./pages/student/TakeExam";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RootRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Navigate to="/student/exam" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Admin routes with sidebar layout */}
            <Route
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/papers" element={<QuestionPapers />} />
              <Route path="/admin/sessions" element={<Sessions />} />
              <Route path="/admin/monitoring" element={<Monitoring />} />
            </Route>

            {/* Student routes (no sidebar — full-screen exam) */}
            <Route
              path="/student/exam"
              element={
                <ProtectedRoute requiredRole="student">
                  <TakeExam />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
