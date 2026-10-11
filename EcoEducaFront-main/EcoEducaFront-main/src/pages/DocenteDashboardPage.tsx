import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { AlertTriangle, Leaf, Printer, Sprout } from "lucide-react";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import AppHeader from "../components/AppHeader";

interface StudentProgress {
  id: string;
  dni: string;
  fullName: string;
  accessProfile: string;
  topicsAnswered: number;
  avgQuizScore: number | null;
  daysSinceLastActivity: number | null;
  atRisk: boolean;
}

interface GreenDashboard {
  studentProgress: StudentProgress[];
  atRiskStudents: StudentProgress[];
  greenMetrics: {
    aiRequestsSaved: number;
    estimatedSheetsSaved: number;
    co2ReductionGrams: number;
  };
}

const PROFILE_LABELS: Record<string, string> = {
  AUDITORY: "Auditivo",
  READING_DEAF: "Lecto-visual",
  GUIDED_MOTOR: "Motor guiado",
  STANDARD: "Estándar",
};

const PIE_COLORS = ["#1E3A5F", "#3D6FA8", "#B8923F", "#94A3B8"];

// Dashboard del Docente: seguimiento académico + métricas verdes (HU-06),
// con gráficos y alertas de alumnos en riesgo.
export default function DocenteDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [dashboard, setDashboard] = useState<GreenDashboard | null>(null);

  useEffect(() => {
    apiClient.get("/teacher/dashboard").then(({ data }) => setDashboard(data));
  }, []);

  const scoreChartData = (dashboard?.studentProgress || []).map((s) => ({
    name: s.fullName.split(" ")[0],
    promedio: s.avgQuizScore ?? 0,
  }));

  const profileDistribution = Object.entries(
    (dashboard?.studentProgress || []).reduce<Record<string, number>>((acc, s) => {
      acc[s.accessProfile] = (acc[s.accessProfile] || 0) + 1;
      return acc;
    }, {})
  ).map(([profile, value]) => ({ name: PROFILE_LABELS[profile] || profile, value }));

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader subtitle={`${user?.fullName} · Docente`} />

      <main className="mx-auto max-w-5xl space-y-10 px-6 py-8">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-eco-green">
            <Leaf className="h-5 w-5" /> Métricas verdes (Eco-Prompting)
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-eco-lightgreen">
                <Sprout className="h-3.5 w-3.5" /> Peticiones de IA ahorradas
              </p>
              <p className="text-3xl font-bold text-eco-green">
                {dashboard?.greenMetrics.aiRequestsSaved ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-eco-lightgreen">
                <Printer className="h-3.5 w-3.5" /> Hojas impresas evitadas (estimado)
              </p>
              <p className="text-3xl font-bold text-eco-green">
                {dashboard?.greenMetrics.estimatedSheetsSaved ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-eco-lightgreen">
                <Leaf className="h-3.5 w-3.5" /> Reducción de CO2 (g, estimado)
              </p>
              <p className="text-3xl font-bold text-eco-green">
                {dashboard?.greenMetrics.co2ReductionGrams ?? "—"}
              </p>
            </div>
          </div>
        </section>

        {dashboard && dashboard.atRiskStudents.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-red-600">
              <AlertTriangle className="h-5 w-5" /> Alumnos en riesgo ({dashboard.atRiskStudents.length})
            </h2>
            <div className="space-y-2">
              {dashboard.atRiskStudents.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{s.fullName}</p>
                    <p className="text-xs text-gray-500">DNI {s.dni}</p>
                  </div>
                  <p className="text-right text-xs font-medium text-red-700">
                    {s.topicsAnswered === 0
                      ? "Sin actividad registrada"
                      : s.avgQuizScore !== null && s.avgQuizScore < 60
                        ? `Bajo rendimiento (${s.avgQuizScore}%)`
                        : `${s.daysSinceLastActivity} días sin actividad`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/teacher/students"
            className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h3 className="text-lg font-bold text-eco-green">Gestión de alumnos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Registra alumnos con DNI y contraseña, marca sus discapacidades y
              revisa/ajusta el perfil de accesibilidad sugerido.
            </p>
          </Link>
          <Link
            to="/teacher/courses"
            className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h3 className="text-lg font-bold text-eco-green">Gestión de cursos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Matricula alumnos en cursos y registra sus notas por bimestre.
            </p>
          </Link>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-gray-800">Promedio de aciertos por alumno</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={scoreChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={((v: unknown) => `${v ?? 0}%`) as never} />
                <Bar dataKey="promedio" fill="#1E3A5F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-gray-800">Distribución de perfiles de accesibilidad</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={profileDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {profileDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
              {profileDistribution.map((p, i) => (
                <span key={p.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  {p.name} ({p.value})
                </span>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-eco-green">Seguimiento académico</h2>
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Alumno</th>
                  <th className="px-4 py-3">DNI</th>
                  <th className="px-4 py-3">Perfil activo</th>
                  <th className="px-4 py-3">Quizzes respondidos</th>
                  <th className="px-4 py-3">Promedio de aciertos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard?.studentProgress.map((s) => (
                  <tr key={s.id} className={s.atRisk ? "bg-red-50/50" : undefined}>
                    <td className="px-4 py-3 font-medium">{s.fullName}</td>
                    <td className="px-4 py-3 text-gray-500">{s.dni}</td>
                    <td className="px-4 py-3 text-gray-500">{PROFILE_LABELS[s.accessProfile] || s.accessProfile}</td>
                    <td className="px-4 py-3 text-gray-500">{s.topicsAnswered}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {s.avgQuizScore !== null ? `${s.avgQuizScore}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
