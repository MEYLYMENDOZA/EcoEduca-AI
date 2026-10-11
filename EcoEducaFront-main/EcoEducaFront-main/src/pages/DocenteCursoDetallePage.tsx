import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileText, Sparkles, Upload } from "lucide-react";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import AppHeader from "../components/AppHeader";

interface StudentBasic {
  id: string;
  fullName: string;
  dni: string;
}

interface Grade {
  userId: string;
  score: number;
  comment: string | null;
}

interface TopicSummary {
  id: string;
  title: string;
  order: number;
  weekLabel: string | null;
  generatedByAI: boolean;
  sourceFileName: string | null;
  contentUpdatedAt: string | null;
  _count: { quizzes: number };
}

interface CourseDetail {
  id: string;
  title: string;
  grade: string;
  topics: TopicSummary[];
  enrollments: { user: StudentBasic }[];
  grades: Grade[];
}

// Gestión de matrícula y notas de un curso específico (rol TEACHER/ADMIN).
export default function DocenteCursoDetallePage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [allStudents, setAllStudents] = useState<StudentBasic[]>([]);
  const [studentToAdd, setStudentToAdd] = useState("");
  const [grades, setGrades] = useState<Record<string, { score: string; comment: string }>>({});
  const [loading, setLoading] = useState(true);
  const [savingGradeFor, setSavingGradeFor] = useState<string | null>(null);
  const [uploadingTopicId, setUploadingTopicId] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<Record<string, { ok: boolean; message: string }>>({});

  async function load() {
    setLoading(true);
    const [coursesRes, studentsRes] = await Promise.all([
      apiClient.get("/teacher/courses"),
      apiClient.get("/teacher/students"),
    ]);
    const found = coursesRes.data.courses.find((c: CourseDetail) => c.id === id) || null;
    setCourse(found);
    setAllStudents(studentsRes.data.students);
    if (found) {
      const initial: Record<string, { score: string; comment: string }> = {};
      for (const e of found.enrollments) {
        const grade = found.grades.find((g: Grade) => g.userId === e.user.id);
        initial[e.user.id] = {
          score: grade ? String(grade.score) : "",
          comment: grade?.comment || "",
        };
      }
      setGrades(initial);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const notEnrolled = useMemo(() => {
    if (!course) return [];
    const enrolledIds = new Set(course.enrollments.map((e) => e.user.id));
    return allStudents.filter((a) => !enrolledIds.has(a.id));
  }, [course, allStudents]);

  async function handleEnroll() {
    if (!studentToAdd || !id) return;
    await apiClient.post(`/teacher/courses/${id}/enrollment`, { userId: studentToAdd });
    setStudentToAdd("");
    load();
  }

  async function handleUnenroll(userId: string) {
    if (!id) return;
    await apiClient.delete(`/teacher/courses/${id}/enrollment/${userId}`);
    load();
  }

  async function handleSaveGrade(userId: string) {
    if (!id) return;
    const entry = grades[userId];
    const scoreNumber = Number(entry?.score);
    if (Number.isNaN(scoreNumber) || scoreNumber < 0 || scoreNumber > 20) return;

    setSavingGradeFor(userId);
    try {
      await apiClient.put(`/teacher/courses/${id}/students/${userId}/grade`, {
        score: scoreNumber,
        comment: entry.comment || undefined,
      });
    } finally {
      setSavingGradeFor(null);
    }
  }

  async function handleMaterialUpload(topicId: string, file: File) {
    setUploadingTopicId(topicId);
    setUploadFeedback((prev) => ({ ...prev, [topicId]: undefined as any }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post(`/teacher/topics/${topicId}/material`, formData);
      setUploadFeedback((prev) => ({ ...prev, [topicId]: { ok: true, message: data.message } }));
      load();
    } catch (err: any) {
      const message =
        err?.response?.data?.error || "No se pudo procesar el material. Intenta nuevamente.";
      setUploadFeedback((prev) => ({ ...prev, [topicId]: { ok: false, message } }));
    } finally {
      setUploadingTopicId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader subtitle={`${user?.fullName} · Gestión de cursos`} />

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        <Link to="/docentes/cursos" className="text-sm text-eco-green hover:underline">
          ← Volver a cursos
        </Link>

        {loading && <p className="text-gray-400">Cargando...</p>}
        {!loading && !course && <p>Curso no encontrado.</p>}

        {course && (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-eco-lightgreen">
                {course.grade}
              </p>
              <h2 className="text-2xl font-bold text-eco-green">{course.title}</h2>
              <p className="text-sm text-gray-400">{course.topics.length} tema(s)</p>
            </div>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-1 flex items-center gap-2 font-bold text-gray-800">
                <Sparkles className="h-4 w-4 text-eco-accent" /> Temas semanales y material con IA
              </h3>
              <p className="mb-4 text-sm text-gray-400">
                Sube el PDF o Word de cada semana en cualquier momento: la IA lee el
                contenido y regenera el resumen y las preguntas de ese tema.
              </p>
              <div className="divide-y divide-slate-100">
                {course.topics.map((topic) => (
                  <div key={topic.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-eco-lightgreen">
                        {topic.weekLabel || `Tema ${topic.order}`}
                      </p>
                      <p className="font-medium text-gray-800">{topic.title}</p>
                      <p className="text-xs text-gray-400">
                        {topic._count.quizzes} pregunta(s)
                        {topic.generatedByAI && (
                          <span className="ml-2 inline-flex items-center gap-1 text-eco-accent">
                            <Sparkles className="h-3 w-3" /> generado por IA
                            {topic.sourceFileName ? ` · ${topic.sourceFileName}` : ""}
                          </span>
                        )}
                      </p>
                      {uploadFeedback[topic.id] && (
                        <p
                          className={`mt-1 text-xs ${
                            uploadFeedback[topic.id].ok ? "text-eco-green" : "text-red-600"
                          }`}
                        >
                          {uploadFeedback[topic.id].message}
                        </p>
                      )}
                    </div>
                    <label
                      className={`flex cursor-pointer items-center gap-2 self-start rounded-lg border border-eco-green px-3 py-1.5 text-xs font-semibold text-eco-green transition hover:bg-eco-green hover:text-white ${
                        uploadingTopicId === topic.id ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      {uploadingTopicId === topic.id ? (
                        <>
                          <FileText className="h-3.5 w-3.5 animate-pulse" /> Procesando con IA...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" /> Subir PDF/Word
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        disabled={uploadingTopicId !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) handleMaterialUpload(topic.id, file);
                        }}
                      />
                    </label>
                  </div>
                ))}
                {course.topics.length === 0 && (
                  <p className="py-4 text-sm text-gray-400">Este curso todavía no tiene temas.</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-800">Matricular alumno</h3>
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={studentToAdd}
                  onChange={(e) => setStudentToAdd(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-eco-green focus:outline-none"
                >
                  <option value="">Selecciona un alumno...</option>
                  {notEnrolled.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} (DNI {a.dni})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleEnroll}
                  disabled={!studentToAdd}
                  className="rounded-lg bg-eco-green px-5 py-2 font-semibold text-white transition hover:bg-eco-lightgreen disabled:opacity-50"
                >
                  Matricular
                </button>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Alumno</th>
                    <th className="px-4 py-3">Nota (0-20)</th>
                    <th className="px-4 py-3">Comentario</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {course.enrollments.map(({ user: student }) => (
                    <tr key={student.id}>
                      <td className="px-4 py-3 font-medium">{student.fullName}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          step={0.5}
                          className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 focus:border-eco-green focus:outline-none"
                          value={grades[student.id]?.score ?? ""}
                          onChange={(e) =>
                            setGrades((prev) => ({
                              ...prev,
                              [student.id]: { ...prev[student.id], score: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 focus:border-eco-green focus:outline-none"
                          value={grades[student.id]?.comment ?? ""}
                          onChange={(e) =>
                            setGrades((prev) => ({
                              ...prev,
                              [student.id]: { ...prev[student.id], comment: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                        <button
                          onClick={() => handleSaveGrade(student.id)}
                          disabled={savingGradeFor === student.id}
                          className="rounded-lg bg-eco-green px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-eco-lightgreen disabled:opacity-60"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => handleUnenroll(student.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {course.enrollments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                        Todavía no hay alumnos matriculados en este curso.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
