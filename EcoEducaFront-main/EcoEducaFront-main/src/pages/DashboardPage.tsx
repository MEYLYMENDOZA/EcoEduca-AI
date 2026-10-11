import { useAuthStore } from "../store/authStore";
import StudentDashboardPage from "./AlumnoDashboardPage";
import TeacherDashboardPage from "./DocenteDashboardPage";

// Punto de entrada post-login: despacha al dashboard según el rol activo.
export default function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role);

  return role === "TEACHER" || role === "ADMIN" ? <TeacherDashboardPage /> : <StudentDashboardPage />;
}
