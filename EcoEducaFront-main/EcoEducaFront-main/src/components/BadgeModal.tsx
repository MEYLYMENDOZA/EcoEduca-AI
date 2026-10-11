import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Footprints, BookOpenCheck, Compass, Flame } from "lucide-react";

interface BadgeData {
  id: string;
  label: string;
  icon: string;
  description: string;
  achieved: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  badge: BadgeData;
  tier: string;
  gradient: string;
  story: string;
  progress?: { current: number; target: number };
}

const ICON_MAP: Record<string, React.ReactNode> = {
  footprints: <Footprints className="h-10 w-10" />,
  "book-open-check": <BookOpenCheck className="h-10 w-10" />,
  flame: <Flame className="h-10 w-10" />,
  compass: <Compass className="h-10 w-10" />,
  star: <Star className="h-10 w-10" />,
};

const TIER_NAMES: Record<string, string> = {
  bronze: "Bronce",
  silver: "Plata",
  gold: "Oro",
  emerald: "Esmeralda",
};

export default function BadgeModal({ open, onClose, badge, tier, gradient, story, progress }: Props) {
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
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Insignia: ${badge.label}`}
            className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Trophy / Medal 3D display */}
            <div className="flex justify-center">
              <motion.div
                initial={{ rotateY: -180, scale: 0 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 14 }}
                className="relative"
              >
                {/* Glow */}
                {badge.achieved && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute -inset-4 rounded-full bg-gradient-to-r ${gradient} opacity-30 blur-xl`}
                  />
                )}

                {/* Large medal */}
                <div
                  className={`relative flex h-28 w-28 items-center justify-center shadow-2xl ${
                    badge.achieved
                      ? `bg-gradient-to-br ${gradient}`
                      : "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500"
                  }`}
                  style={{
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                >
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full ${
                      badge.achieved ? "bg-white/20 backdrop-blur-sm" : "bg-gray-500/30"
                    }`}
                  >
                    <span className={`drop-shadow-lg ${badge.achieved ? "text-white" : "text-gray-600"}`}>
                      {ICON_MAP[badge.icon] || <Star className="h-10 w-10" />}
                    </span>
                  </div>

                  {/* Shine */}
                  {badge.achieved && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      style={{
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      }}
                    />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Tier badge */}
            <div className="mt-4 flex justify-center">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  badge.achieved
                    ? tier === "bronze"
                      ? "bg-amber-100 text-amber-800"
                      : tier === "silver"
                        ? "bg-slate-100 text-slate-700"
                        : tier === "gold"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {badge.achieved ? `Medalla de ${TIER_NAMES[tier] || tier}` : "Bloqueada"}
              </span>
            </div>

            {/* Title */}
            <h3 className="mt-4 text-center text-xl font-bold text-gray-800">{badge.label}</h3>

            {/* Story / Description */}
            <div className="mt-3 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 p-4">
              <p className="text-center text-sm leading-relaxed text-gray-600">
                {badge.achieved ? story : badge.description}
              </p>
            </div>

            {/* Progress bar for locked */}
            {!badge.achieved && progress && (
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-xs text-gray-500">
                  <span>Progreso</span>
                  <span>{progress.current}/{progress.target}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress.current / progress.target) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                  />
                </div>
                <p className="mt-2 text-center text-xs text-gray-400">
                  {progress.target - progress.current} más para desbloquear
                </p>
              </div>
            )}

            {/* Achievement date placeholder */}
            {badge.achieved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 text-center"
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  ✓ Desbloqueada
                </span>
              </motion.div>
            )}

            {/* Action button */}
            <button
              onClick={onClose}
              className={`mt-6 w-full rounded-xl py-3 font-semibold text-white shadow-lg transition hover:shadow-xl ${
                badge.achieved
                  ? "bg-gradient-to-r from-eco-green to-eco-lightgreen"
                  : "bg-gradient-to-r from-gray-500 to-gray-600"
              }`}
            >
              {badge.achieved ? "¡Seguir aprendiendo!" : "Cerrar"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}