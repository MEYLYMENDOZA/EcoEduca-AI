import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles, ArrowRight, RotateCcw, Medal } from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  open: boolean;
  onClose: () => void;
  xpEarned: number;
  correctCount: number;
  totalQuestions: number;
  newBadgeUnlocked?: string | null;
  onNextTopic?: () => void;
  onBackToCourse?: () => void;
}

export default function VictoryCelebration({
  open,
  onClose,
  xpEarned,
  correctCount,
  totalQuestions,
  newBadgeUnlocked,
  onNextTopic,
  onBackToCourse,
}: Props) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (open && !hasFired.current) {
      hasFired.current = true;

      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#B8923F", "#1E3A5F", "#3D6FA8", "#FFD700"],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#B8923F", "#1E3A5F", "#3D6FA8", "#FFD700"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Big burst at start
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#B8923F", "#1E3A5F", "#3D6FA8", "#FFD700", "#FF6B6B"],
      });
    }

    if (!open) {
      hasFired.current = false;
    }
  }, [open]);

  const pct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 40 }}
            transition={{ type: "spring", damping: 18, stiffness: 180 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="¡Lección completada!"
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Background decoration */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-yellow-100/50" />
            <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-eco-green/10" />

            <div className="relative p-8 text-center">
              {/* Trophy */}
              <motion.div
                initial={{ y: -20, rotate: -10 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <Trophy className="h-20 w-20 text-yellow-500 drop-shadow-lg" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -inset-4 rounded-full bg-yellow-400/20 blur-xl"
                  />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 font-display text-2xl font-bold text-gray-800"
              >
                ¡Lección Completada!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-1 text-sm text-gray-500"
              >
                {pct >= 80
                  ? "¡Excelente trabajo! Dominas este tema."
                  : pct >= 50
                    ? "¡Buen esfuerzo! Sigue practicando para mejorar."
                    : "Sigue intentándolo, la práctica hace al maestro."}
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mx-auto mt-6 flex max-w-xs justify-center gap-4"
              >
                <div className="rounded-xl bg-gradient-to-br from-eco-green to-eco-lightgreen px-5 py-3 text-white shadow-lg">
                  <motion.p
                    key={xpEarned}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold"
                  >
                    +{xpEarned}
                  </motion.p>
                  <p className="text-xs text-white/80">XP ganado</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-eco-accent to-yellow-500 px-5 py-3 text-white shadow-lg">
                  <p className="text-2xl font-bold">{pct}%</p>
                  <p className="text-xs text-white/80">Aciertos</p>
                </div>
              </motion.div>

              {/* Score bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.6 }}
                className="mx-auto mt-4 max-w-xs"
              >
                <div className="mb-1 flex justify-between text-xs text-gray-400">
                  <span>{correctCount} correctas</span>
                  <span>{totalQuestions - correctCount} incorrectas</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full rounded-full bg-gradient-to-r from-eco-accent to-yellow-400"
                  />
                </div>
              </motion.div>

              {/* New badge notification */}
              {newBadgeUnlocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mx-auto mt-4 flex items-center gap-2 rounded-xl border-2 border-yellow-300 bg-yellow-50 px-4 py-3"
                >
                  <Medal className="h-6 w-6 text-yellow-600" />
                  <div className="text-left">
                    <p className="text-xs font-bold uppercase text-yellow-700">¡Nueva insignia!</p>
                    <p className="text-sm font-semibold text-yellow-800">{newBadgeUnlocked}</p>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-6 flex flex-col gap-3 sm:flex-row"
              >
                {onNextTopic && (
                  <button
                    onClick={onNextTopic}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-lightgreen px-5 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
                  >
                    Siguiente tema <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {onBackToCourse && (
                  <button
                    onClick={onBackToCourse}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 px-5 py-3 font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <RotateCcw className="h-4 w-4" /> Volver al curso
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}