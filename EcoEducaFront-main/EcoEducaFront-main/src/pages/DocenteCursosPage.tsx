import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import AppHeader from "../components/AppHeader";

interface Curso {
  id: string;
  title: string;
  grade: string;
  topics: { id: string; title: string }[];
  enrollments: { user: { id: string; fullName: string } }[];
}

// Listado de cursos para el docente: acceso a matrícula y notas por curso.
export default function DocenteCursosPage() {
  const user = useAuthStore((s) => s.user);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/teacher/courses")
      .then(({ data }) => setCursos(data.courses))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader subtitle={`${user?.fullName} · Gestión de cursos`} />

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <h2 className="text-lg font-bold text-eco-green">Cursos curriculares</h2>

        {loading && <p className="text-gray-400">Cargando...</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {cursos.map((curso) => (
            <Link
              key={curso.id}
              to={`/docentes/cursos/${curso.id}`}
              className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-eco-lightgreen">
                {curso.grade}
              </p>
              <h3 className="text-lg font-bold">{curso.title}</h3>
              <p className="mt-3 text-xs font-medium text-gray-400">
                {curso.topics.length} tema(s) · {curso.enrollments.length} alumno(s) matriculado(s)
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
