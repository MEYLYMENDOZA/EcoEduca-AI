import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles, ChevronRight, BookOpen, Target, Star, GraduationCap, Globe2, Calculator, FlaskConical } from "lucide-react";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import AppHeader from "../components/AppHeader";

interface TopicSummary {
  id: string;
  title: string;
  order: number;
  weekLabel: string | null;
  totalQuizzes: number;
  answeredQuizzes: number;
  completed: boolean;
}

interface CourseDetail {
  id: string;
  title: string;
  grade: string;
  topics: TopicSummary[];
  recommendedTopicId: string | null;
}

const COURSE_GRADIENTS: Record<string, string> = {
  "Ciencia y Tecnología": "from-emerald-700 via-emerald-600 to-green-500",
  "Personal Social": "from-blue-800 via-blue-700 to-indigo-600",
  "Razonamiento Matemático": "from-amber-700 via-yellow-600 to-orange-500",
  Comunicación: "from-purple-700 via-purple-600 to-fuchsia-500",
};

const COURSE_ICONS: Record<string, React.ReactNode> = {
  "Ciencia y Tecnología": <FlaskConical className="h-8 w-8 text-white/80" />,
  "Personal Social": <Globe2 className="h-8 w-8 text-white/80" />,
  "Razonamiento Matemático": <Calculator className="h-8 w-8 text-white/80" />,
  Comunicación: <BookOpen className="h-8 w-8 text-white/80" />,
};

export default function CoursePage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/courses/${id}`)
      .then(({ data }) => setCourse(data.course))
      .finally(() => setLoading(false));
  }, [id]);

  const gradient = course ? COURSE_GRADIENTS[course.title] || "from-eco-green via-eco-lightgreen to-eco-dark" : "";
  const icon = course ? COURSE_ICONS[course.title] || <GraduationCap className="h-8 w-8 text-white/80" /> : null;
  const totalProgress = course
    ? course.topics.length > 0
      ? Math.round(
          (course.topics.reduce((acc, t) => acc + t.answeredQuizzes, 0) /
            course.topics.reduce((acc, t) => acc + t.totalQuizzes, 1)) *
            100
        )
      : 0
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader subtitle={user?.fullName || ""} />

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <Link to="/dashboard" className="flex items-center gap-1 text-sm text-eco-green hover:underline">
          ← Volver a mis cursos
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-10 w-10 text-eco-accent" />
            </motion.div>
          </div>
        )}
        {!loading && !course && <p className="text-center text-gray-400">Curso no encontrado.</p>}

        {course && (
          <>
            {/* Course Hero Banner */}
            <div className={`overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-card sm:p-8`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                    {course.grade}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{course.title}</h2>
                  <p className="mt-2 text-sm text-white/70">
                    {course.topics.length} tema{course.topics.length !== 1 ? "s" : ""} · avanza a tu ritmo
                  </p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  {icon}
                </div>
              </div>

              {/* Overall progress */}
              <div className="mt-6">
                <div className="mb-1 flex justify-between text-xs text-white/70">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" /> Progreso total
                  </span>
                  <span>{totalProgress}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgress}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-eco-accent via-yellow-400 to-amber-300"
                  />
                </div>
              </div>
            </div>

            {/* Topics list */}
            <div className="space-y-3">
              {course.topics.map((topic, i) => {
                const isRecommended = topic.id === course.recommendedTopicId;
                const progress =
                  topic.totalQuizzes > 0
                    ? (topic.answeredQuizzes / topic.totalQuizzes) * 100
                    : 0;

                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/temas/${topic.id}`}
                      className={`group flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        isRecommended
                          ? "border-eco-accent ring-2 ring-eco-accent/30"
                          : "border-slate-100"
                      }`}
                    >
                      {/* Status icon */}
                      <span className="shrink-0">
                        {topic.completed ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <CheckCircle2 className="h-8 w-8 text-eco-green" />
                          </motion.div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 text-xs font-bold text-gray-400">
                            {topic.order}
                          </div>
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-eco-lightgreen">
                            {topic.weekLabel || `Semana ${topic.order}`}
                          </p>
                          {isRecommended && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 rounded-full bg-eco-accent/20 px-2.5 py-0.5 text-[11px] font-bold text-eco-accent"
                            >
                              <Sparkles className="h-3 w-3" /> Recomendado
                            </motion.span>
                          )}
                        </div>
                        <h3 className="truncate font-bold text-gray-800">{topic.title}</h3>

                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className={`h-full rounded-full transition-all ${
                              topic.completed ? "bg-eco-green" : "bg-eco-accent"
                            }`}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-gray-400">
                          {topic.answeredQuizzes}/{topic.totalQuizzes} preguntas
                          {topic.completed && " ✅ Completado"}
                        </p>
                      </div>

                      <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-0.5" />
                    </Link>
                  </motion.div>
                );
              })}
              {course.topics.length === 0 && (
                <p className="text-center text-gray-400">
                  Este curso todavía no tiene temas disponibles.
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}