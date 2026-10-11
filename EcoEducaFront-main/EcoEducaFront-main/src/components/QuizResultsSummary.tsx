import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, ArrowRight, RotateCcw } from "lucide-react";

interface Props {
  courseId: string;
  totalQuestions: number;
  correctCount: number;
  xpEarned: number;
}

// Resumen final tras responder todos los quizzes de un tema: refuerza la
// gamificación (XP ganado, % de aciertos) y ofrece una salida clara.
export default function QuizResultsSummary({ courseId, totalQuestions, correctCount, xpEarned }: Props) {
  const pct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl bg-gradient-to-br from-eco-dark via-eco-green to-eco-lightgreen p-6 text-center text-white shadow-card sm:p-8"
    >
      <Trophy className="mx-auto h-10 w-10 text-eco-accent" />
      <h3 className="mt-2 font-display text-xl font-bold sm:text-2xl">¡Tema completado!</h3>
      <p className="mt-1 text-sm text-white/70">
        Respondiste {correctCount} de {totalQuestions} preguntas correctamente ({pct}%).
      </p>

      <div className="mx-auto mt-5 flex max-w-xs justify-center gap-4">
        <div className="rounded-xl bg-white/10 px-5 py-3 backdrop-blur">
          <p className="text-2xl font-bold">+{xpEarned}</p>
          <p className="text-xs text-white/70">XP ganado</p>
        </div>
        <div className="rounded-xl bg-white/10 px-5 py-3 backdrop-blur">
          <p className="text-2xl font-bold">{pct}%</p>
          <p className="text-xs text-white/70">de aciertos</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          to={`/cursos/${courseId}`}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-eco-green transition hover:bg-white/90"
        >
          Volver al curso <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" /> Repasar de nuevo
        </button>
      </div>
    </motion.div>
  );
}
