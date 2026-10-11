import { FormEvent, useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuthStore, AccessProfile } from "../store/authStore";
import AppHeader from "../components/AppHeader";

interface Student {
  id: string;
  fullName: string;
  dni: string;
  grade: string | null;
  accessProfile: AccessProfile;
  disabilities: string | null;
  enrollments: { course: { id: string; title: string } }[];
  grades: { courseId: string; score: number; comment: string | null }[];
}

const DISABILITIES: { value: string; label: string }[] = [
  { value: "VISUAL", label: "Discapacidad Visual" },
  { value: "AUDITIVA", label: "Discapacidad Auditiva" },
  { value: "MOTORA", label: "Dificultad Motora" },
  { value: "INTELECTUAL", label: "Discapacidad Intelectual" },
  { value: "DYSLEXIA", label: "Dislexia" },
  { value: "TDAH", label: "TDAH" },
  { value: "TEA", label: "Trastorno del Espectro Autista" },
];

const PROFILES: { value: AccessProfile; label: string; icon: string }[] = [
  { value: "STANDARD", label: "Estándar", icon: "🎯" },
  { value: "VISUAL", label: "Visual (pictogramas, infografías)", icon: "👁️" },
  { value: "AUDITORY", label: "Auditivo (narración, voz)", icon: "🎧" },
  { value: "MOTOR", label: "Motor (macro-botones, SÍ/NO)", icon: "🖐️" },
  { value: "DYSLEXIA", label: "Dislexia (tipografía, audio)", icon: "📖" },
  { value: "ADHD", label: "TDAH (timer, micro-sesiones)", icon: "⚡" },
  { value: "AUTISM", label: "TEA (rutina, sin sorpresas)", icon: "🧩" },
  { value: "ADVANCED", label: "Avanzado (contenido extra)", icon: "🚀" },
  { value: "LANGUAGE", label: "Idioma (vocabulario simple)", icon: "🌐" },
  { value: "NIGHT", label: "Nocturno (modo oscuro)", icon: "🌙" },
];

const initialForm = { fullName: "", dni: "", password: "", grade: "" };

export default function DocenteAlumnosPage() {
  const user = useAuthStore((s) => s.user);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [disabilities, setDisabilities] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  function loadStudents() {
    setLoading(true);
    apiClient
      .get("/teacher/students")
      .then(({ data }) => setStudents(data.students))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function toggleDisability(value: string) {
    setDisabilities((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setCreating(true);
    try {
      await apiClient.post("/teacher/students", { ...form, disabilities });
      setForm(initialForm);
      setDisabilities([]);
      loadStudents();
    } catch (err: any) {
      setFormError(err?.response?.data?.error || "No se pudo crear el alumno.");
    } finally {
      setCreating(false);
    }
  }

  async function handleProfileChange(studentId: string, accessProfile: AccessProfile) {
    setSavingId(studentId);
    try {
      await apiClient.put(`/teacher/students/${studentId}`, { accessProfile });
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, accessProfile } : s))
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader subtitle={`${user?.fullName} · Gestión de alumnos`} />

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-eco-green">Registrar nuevo alumno</h2>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="fullName">
                Nombre completo
              </label>
              <input
                id="fullName"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-eco-green focus:outline-none"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="dni">
                DNI (8 dígitos)
              </label>
              <input
                id="dni"
                required
                maxLength={8}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-eco-green focus:outline-none"
                value={form.dni}
                onChange={(e) => setForm({ ...form, dni: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
                Contraseña inicial
              </label>
              <input
                id="password"
                type="text"
                required
                minLength={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-eco-green focus:outline-none"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="grade">
                Grado / aula
              </label>
              <input
                id="grade"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-eco-green focus:outline-none"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="Ej: 5to Grado B - Primaria"
              />
            </div>

            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Condiciones (sugiere automáticamente el perfil de accesibilidad)
              </p>
              <div className="flex flex-wrap gap-4">
                {DISABILITIES.map((d) => (
                  <label key={d.value} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={disabilities.includes(d.value)}
                      onChange={() => toggleDisability(d.value)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-600 sm:col-span-2" role="alert">
                {formError}
              </p>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-eco-green px-5 py-2.5 font-semibold text-white transition hover:bg-eco-lightgreen disabled:opacity-60"
              >
                {creating ? "Registrando..." : "Registrar alumno"}
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-eco-green">Alumnos registrados</h2>
          {loading && <p className="text-gray-400">Cargando...</p>}
          {!loading && students.length === 0 && (
            <p className="text-gray-400">Todavía no hay alumnos registrados.</p>
          )}
          <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">DNI</th>
                  <th className="px-4 py-3">Grado</th>
                  <th className="px-4 py-3">Cursos</th>
                  <th className="px-4 py-3">Perfil de accesibilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const profileInfo = PROFILES.find((p) => p.value === s.accessProfile);
                  return (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-medium">{s.fullName}</td>
                      <td className="px-4 py-3 text-gray-500">{s.dni}</td>
                      <td className="px-4 py-3 text-gray-500">{s.grade || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {s.enrollments.length > 0
                          ? s.enrollments.map((e) => e.course.title).join(", ")
                          : "Sin matrícula"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={s.accessProfile}
                          disabled={savingId === s.id}
                          onChange={(e) =>
                            handleProfileChange(s.id, e.target.value as AccessProfile)
                          }
                          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-eco-green focus:outline-none"
                        >
                          {PROFILES.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.icon} {p.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}