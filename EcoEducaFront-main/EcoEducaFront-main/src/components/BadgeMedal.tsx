import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Flame, Footprints, BookOpenCheck, Compass, Star } from "lucide-react";
import BadgeModal from "./BadgeModal";

interface BadgeData {
  id: string;
  label: string;
  icon: string;
  description: string;
  achieved: boolean;
  progress?: { current: number; target: number };
  story?: string;
}

interface Props {
  badge: BadgeData;
  index?: number;
}

const MEDAL_GRADIENTS: Record<string, string> = {
  bronze: "from-amber-700 via-amber-500 to-yellow-600",
  silver: "from-gray-400 via-gray-300 to-slate-200",
  gold: "from-yellow-600 via-yellow-400 to-amber-300",
  emerald: "from-emerald-700 via-emerald-500 to-green-400",
};

const MEDAL_BORDERS: Record<string, string> = {
  bronze: "shadow-amber-500/40",
  silver: "shadow-slate-300/40",
  gold: "shadow-yellow-400/50",
  emerald: "shadow-emerald-400/40",
};

const BADGE_TIER: Record<string, string> = {
  primer_paso: "bronze",
  veinte_respuestas: "silver",
  racha_3: "bronze",
  racha_7: "gold",
  explorador: "emerald",
  perfeccionista: "gold",
};

const BADGE_STORIES: Record<string, string> = {
  primer_paso: "¡Diste tu primer paso en EcoEduca! Cada gran viaje comienza con una pequeña decisión.",
  veinte_respuestas: "Has respondido 20 preguntas. Tu dedicación está construyendo un futuro brillante.",
  racha_3: "3 días seguidos estudiando. ¡La constancia es la clave del éxito!",
  racha_7: "¡Una semana completa de aprendizaje! Eres imparable. Sigue así y lograrás grandes cosas.",
  explorador: "Has explorado 3 temas diferentes. La curiosidad es la puerta al conocimiento infinito.",
  perfeccionista: "¡Lograste el 100% de aciertos en un tema! La excelencia es tu sello personal.",
};

const BADGE_PROGRESS: Record<string, { current: number; target: number }> = {
  racha_3: { current: 0, target: 3 },
  racha_7: { current: 0, target: 7 },
  veinte_respuestas: { current: 0, target: 20 },
  explorador: { current: 0, target: 3 },
};

const ICON_MAP: Record<string, React.ReactNode> = {
  footprints: <Footprints className="h-6 w-6" />,
  "book-open-check": <BookOpenCheck className="h-6 w-6" />,
  flame: <Flame className="h-6 w-6" />,
  compass: <Compass className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
};

export default function BadgeMedal({ badge, index = 0 }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const tier = BADGE_TIER[badge.id] || "bronze";
  const gradient = MEDAL_GRADIENTS[tier];
  const borderGlow = MEDAL_BORDERS[tier];
  const story = BADGE_STORIES[badge.id] || badge.description;
  const progress = BADGE_PROGRESS[badge.id];

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
        whileHover={{ scale: 1.08, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setModalOpen(true)}
        className="group relative flex flex-col items-center gap-2"
      >
        {/* Medal Container */}
        <div className="relative">
          {/* Outer glow ring */}
          {badge.achieved && (
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute -inset-2 rounded-full bg-gradient-to-r ${gradient} opacity-30 blur-md ${borderGlow}`}
            />
          )}

          {/* Medal shape - hexagonal with metallic finish */}
          <div
            className={`relative flex h-20 w-20 items-center justify-center transition-all duration-300 ${
              badge.achieved
                ? `bg-gradient-to-br ${gradient} shadow-lg ${borderGlow}`
                : "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500"
            }`}
            style={{
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          >
            {/* Inner circle */}
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                badge.achieved
                  ? "bg-white/20 backdrop-blur-sm"
                  : "bg-gray-500/30"
              }`}
            >
              {badge.achieved ? (
                <span className="text-white drop-shadow-lg">
                  {ICON_MAP[badge.icon] || <Star className="h-6 w-6" />}
                </span>
              ) : (
                <Lock className="h-6 w-6 text-gray-600" />
              )}
            </div>

            {/* Shine effect */}
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

          {/* Lock overlay for unachieved */}
          {!badge.achieved && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-gray-800/60 p-1.5 backdrop-blur-sm">
                <Lock className="h-4 w-4 text-gray-300" />
              </div>
            </div>
          )}
        </div>

        {/* Label */}
        <p
          className={`text-center text-xs font-semibold transition-colors ${
            badge.achieved ? "text-gray-800" : "text-gray-400"
          }`}
        >
          {badge.label}
        </p>

        {/* Progress bar for locked badges */}
        {!badge.achieved && progress && (
          <div className="w-full max-w-[80px]">
            <div className="mb-0.5 flex justify-between text-[9px] text-gray-400">
              <span>{progress.current}/{progress.target}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progress.current / progress.target) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
              />
            </div>
          </div>
        )}

        {/* Pulse animation for achieved */}
        {badge.achieved && (
          <motion.div
            className="absolute -inset-1 rounded-full border-2 border-yellow-400/30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
          />
        )}
      </motion.button>

      <BadgeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        badge={badge}
        tier={tier}
        gradient={gradient}
        story={story}
        progress={progress}
      />
    </>
  );
}