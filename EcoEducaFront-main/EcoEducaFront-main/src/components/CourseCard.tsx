import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe2, BookOpen, Calculator, FlaskConical, GraduationCap, Sparkles, ChevronRight } from "lucide-react";

interface CourseCardData {
  id: string;
  title: string;
  grade: string;
  progress?: number;
  recommendedTopic?: string;
}

interface Props {
  course: CourseCardData;
  index?: number;
}

const COURSE_THEMES: Record<string, { gradient: string; icon: React.ReactNode; accent: string }> = {
  "Ciencia y Tecnología": {
    gradient: "from-emerald-700 via-emerald-600 to-green-500",
    icon: <FlaskConical className="h-10 w-10 text-white/80" />,
    accent: "emerald",
  },
  "Personal Social": {
    gradient: "from-blue-800 via-blue-700 to-indigo-600",
    icon: <Globe2 className="h-10 w-10 text-white/80" />,
    accent: "blue",
  },
  "Razonamiento Matemático": {
    gradient: "from-amber-700 via-yellow-600 to-orange-500",
    icon: <Calculator className="h-10 w-10 text-white/80" />,
    accent: "amber",
  },
  Comunicación: {
    gradient: "from-purple-700 via-purple-600 to-fuchsia-500",
    icon: <BookOpen className="h-10 w-10 text-white/80" />,
    accent: "purple",
  },
};

const ACCENT_COLORS: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function CourseCard({ course, index = 0 }: Props) {
  const theme = COURSE_THEMES[course.title] || {
    gradient: "from-eco-green via-eco-lightgreen to-eco-dark",
    icon: <GraduationCap className="h-10 w-10 text-white/80" />,
    accent: "blue",
  };

  const accentClass = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link
        to={`/cursos/${course.id}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
      >
        {/* Banner */}
        <div className={`relative h-28 bg-gradient-to-br ${theme.gradient} p-5`}>
          {/* Decorative circles */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {course.grade}
              </p>
              <h3 className="mt-1 font-display text-lg font-bold text-white">{course.title}</h3>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              {theme.icon}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 p-4">
          {/* Progress bar */}
          {course.progress !== undefined && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>Progreso del curso</span>
                <span>{Math.round(course.progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-full rounded-full ${
                    theme.accent === "emerald"
                      ? "bg-emerald-500"
                      : theme.accent === "blue"
                        ? "bg-blue-500"
                        : theme.accent === "amber"
                          ? "bg-amber-500"
                          : "bg-purple-500"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Recommended topic */}
          {course.recommendedTopic && (
            <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${accentClass}`}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Tema recomendado: {course.recommendedTopic}</span>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Continuar aprendiendo</span>
            <ChevronRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}