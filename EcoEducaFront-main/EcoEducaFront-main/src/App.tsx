import { Routes, Route } from "react-router-dom";
import AccessibilityWrapper from "./components/AccessibilityWrapper";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CoursePage from "./pages/CoursePage";
import TopicPage from "./pages/TopicPage";
import DocenteAlumnosPage from "./pages/DocenteAlumnosPage";
import DocenteCursosPage from "./pages/DocenteCursosPage";
import DocenteCursoDetallePage from "./pages/DocenteCursoDetallePage";

export default function App() {
  return (
    <AccessibilityWrapper>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cursos/:id"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <CoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/temas/:id"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <TopicPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute allowedRoles={["TEACHER", "ADMIN"]}>
              <DocenteAlumnosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute allowedRoles={["TEACHER", "ADMIN"]}>
              <DocenteCursosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docentes/cursos/:id"
          element={
            <ProtectedRoute allowedRoles={["TEACHER", "ADMIN"]}>
              <DocenteCursoDetallePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AccessibilityWrapper>
  );
}
