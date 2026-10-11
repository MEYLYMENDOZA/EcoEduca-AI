import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Leaf, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import AccessibilitySettingsPanel from "./AccessibilitySettingsPanel";

interface Props {
  subtitle: ReactNode;
}

const NAV_TEACHER = [
  { to: "/dashboard", label: "Resumen" },
  { to: "/teacher/students", label: "Alumnos" },
  { to: "/teacher/courses", label: "Cursos" },
];

// Encabezado compartido del panel autenticado (Alumno/Docente)
export default function AppHeader({ subtitle }: Props) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="bg-eco-dark text-white shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Leaf className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">EcoEduca·AI</h1>
            <p className="text-xs text-white/60">{subtitle}</p>
          </div>
        </div>

        {(user?.role === "TEACHER" || user?.role === "ADMIN") && (
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Navegación docente">
            {NAV_TEACHER.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  location.pathname === item.to
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user?.role === "STUDENT" && (
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Ajustes de accesibilidad"
              title="Mis ajustes de accesibilidad"
              className="rounded-lg border border-white/20 p-2.5 text-white/90 transition hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>

      <AccessibilitySettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
