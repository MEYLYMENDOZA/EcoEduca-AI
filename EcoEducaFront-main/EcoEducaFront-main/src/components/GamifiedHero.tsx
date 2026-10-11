import { motion } from "framer-motion";
import { Trophy, Flame, Target, Sparkles, Shield, Star } from "lucide-react";

interface Props {
  fullName: string;
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpPerLevel: number;
  streak: number;
  accuracyPct: number | null;
  avatarUrl?: string;
}

const LEVEL_FRAMES: Record<number, string> = {
  1: "ring-4 ring-amber-700 shadow-amber-700/30", // Madera
  2: "ring-4 ring-amber-500 shadow-amber-500/40", // Bronce
  3: "ring-4 ring-slate-300 shadow-slate-300/40", // Plata
  4: "ring-4 ring-yellow-400 shadow-yellow-400/50", // Oro
};

const LEVEL_FRAME_COLORS: Record<number, string> = {
  1: "from-amber-800 to-amber-600",
  2: "from-amber-600 to-yellow-500",
  3: "from-slate-400 to-slate-200",
  4: "from-yellow-500 to-amber-300",
};

export default function GamifiedHero({
  fullName,
  level,
  xp,
  xpIntoLevel,
  xpPerLevel,
  streak,
  accuracyPct,
  avatarUrl,
}: Props) {
  const frameKey = level >= 4 ? 4 : (level as 1 | 2 | 3 | 4);
  const frameRing = LEVEL_FRAMES[frameKey] || LEVEL_FRAMES[1];
  const frameColor = LEVEL_FRAME_COLORS[frameKey] || LEVEL_FRAME_COLORS[1];
  const progressPct = (xpIntoLevel / xpPerLevel) * 100;

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-eco-dark via-eco-green to-eco-lightgreen p-6 text-white shadow-card sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Avatar with evolving frame */}
        <div className="flex items-center gap-4">
          <div className={`relative rounded-full p-0.5 ${frameRing}`}>
            <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${frameColor} flex items-center justify-center`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white drop-shadow-lg">
                  {fullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-eco-accent text-[10px] font-bold text-white shadow-lg ring-2 ring-white">
              {level}
            </div>
          </div>

          <div>
            <p className="text-sm text-white/70">¡Hola de nuevo!</p>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{fullName}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-eco-accent">
              <Trophy className="h-4 w-4" /> Nivel {level}
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="flex gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur"
          >
            <motion.p
              key={xp}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold"
            >
              {xp}
            </motion.p>
            <p className="text-xs text-white/70">XP total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur"
          >
            <p className="flex items-center justify-center gap-1 text-2xl font-bold">
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame className={`h-5 w-5 ${streak > 0 ? "text-orange-400" : "text-white/50"}`} />
              </motion.span>
              {streak}
            </p>
            <p className="text-xs text-white/70">Días de racha</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur"
          >
            <p className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Target className="h-5 w-5 text-eco-accent" /> {accuracyPct ?? "—"}%
            </p>
            <p className="text-xs text-white/70">Precisión</p>
          </motion.div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mt-6">
        <div className="mb-1 flex items-center justify-between text-xs text-white/70">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-eco-accent" /> Nivel {level}
          </span>
          <span>{xpIntoLevel}/{xpPerLevel} XP</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative h-full rounded-full bg-gradient-to-r from-eco-accent via-yellow-400 to-amber-300"
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
      </div>

      {/* Streak fire animation */}
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Flame className="h-5 w-5 text-orange-400" />
          </motion.div>
          <span className="text-sm text-white/80">
            <strong className="text-eco-accent">{streak}</strong> día{streak !== 1 ? "s" : ""} consecutivo
            {streak >= 7 ? " ¡Imparable! 🔥" : streak >= 3 ? " ¡Sigue así! 💪" : ""}
          </span>
        </motion.div>
      )}
    </section>
  );
}