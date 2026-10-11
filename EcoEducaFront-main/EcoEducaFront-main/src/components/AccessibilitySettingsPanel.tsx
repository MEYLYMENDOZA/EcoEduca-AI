import { X, Volume2, Type, Contrast, PlayCircle, Mic, Wind, Timer, Eye, Moon, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAccessibilitySettings } from "../store/accessibilitySettings";
import { useAuthStore, AccessProfile } from "../store/authStore";
import { PROFILE_INFO } from "./AccessibilityWrapper";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AccessibilitySettingsPanel({ open, onClose }: Props) {
  const accessProfile = useAuthStore((s) => s.user?.accessProfile) || "STANDARD";
  const profileInfo = PROFILE_INFO[accessProfile];
  const {
    fontScale,
    voiceRate,
    autoNarration,
    extraContrast,
    voiceCommands,
    simplifiedMode,
    reduceAnimations,
    openDyslexic,
    darkMode,
    showTimer,
    timerMinutes,
    setFontScale,
    setVoiceRate,
    setAutoNarration,
    setExtraContrast,
    setVoiceCommands,
    setSimplifiedMode,
    setReduceAnimations,
    setOpenDyslexic,
    setDarkMode,
    setShowTimer,
    setTimerMinutes,
  } = useAccessibilitySettings();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Ajustes de accesibilidad"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-eco-green">Mis ajustes</h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  {profileInfo.icon} {profileInfo.label} — {profileInfo.description}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-2">
              {/* Font Size */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Type className="h-4 w-4 text-eco-lightgreen" /> Tamaño de texto
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 1, label: "Normal" },
                    { v: 1.15, label: "Grande" },
                    { v: 1.3, label: "Muy grande" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setFontScale(opt.v)}
                      className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition ${
                        fontScale === opt.v
                          ? "border-eco-green bg-eco-green/10 text-eco-green"
                          : "border-gray-200 text-gray-600 hover:border-eco-lightgreen"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Rate */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Volume2 className="h-4 w-4 text-eco-lightgreen" /> Velocidad de voz ({voiceRate.toFixed(2)}x)
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(Number(e.target.value))}
                  className="w-full accent-eco-green"
                  aria-label="Velocidad de voz"
                />
              </div>

              {/* Toggle options */}
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <PlayCircle className="h-4 w-4 text-eco-lightgreen" /> Narrar automáticamente
                  </span>
                  <input
                    type="checkbox"
                    checked={autoNarration}
                    onChange={(e) => setAutoNarration(e.target.checked)}
                    className="h-5 w-5 accent-eco-green"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Contrast className="h-4 w-4 text-eco-lightgreen" /> Alto contraste
                  </span>
                  <input
                    type="checkbox"
                    checked={extraContrast}
                    onChange={(e) => setExtraContrast(e.target.checked)}
                    className="h-5 w-5 accent-eco-green"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Mic className="h-4 w-4 text-eco-lightgreen" /> Comandos de voz
                  </span>
                  <input
                    type="checkbox"
                    checked={voiceCommands}
                    onChange={(e) => setVoiceCommands(e.target.checked)}
                    className="h-5 w-5 accent-eco-green"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Wind className="h-4 w-4 text-eco-lightgreen" /> Modo simplificado
                  </span>
                  <input
                    type="checkbox"
                    checked={simplifiedMode}
                    onChange={(e) => setSimplifiedMode(e.target.checked)}
                    className="h-5 w-5 accent-eco-green"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Sparkles className="h-4 w-4 text-eco-lightgreen" /> Reducir animaciones
                  </span>
                  <input
                    type="checkbox"
                    checked={reduceAnimations}
                    onChange={(e) => setReduceAnimations(e.target.checked)}
                    className="h-5 w-5 accent-eco-green"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Eye className="h-4 w-4 text-eco-lightgreen" /> Dislexia (tipografía especial)
                  </span>
                  <input
                    type="checkbox"
                    checked={openDyslexic}
                    onChange={(e) => setOpenDyslexic(e.target.checked)}
                    className="h-5 w-5 accent-eco-green"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Moon className="h-4 w-4 text-eco-lightgreen" /> Modo oscuro
                  </span>
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="h-5 w-5 accent-eco-green"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Timer className="h-4 w-4 text-eco-lightgreen" /> Mostrar timer
                  </span>
                  <input
                    type="checkbox"
                    checked={showTimer}
                    onChange={(e) => setShowTimer(e.target.checked)}
                    className="h-5 w-5 accent-eco-green"
                  />
                </label>
              </div>

              {/* Timer minutes */}
              {showTimer && (
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Timer className="h-4 w-4 text-eco-lightgreen" /> Minutos por sesión
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={30}
                    step={1}
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(Number(e.target.value))}
                    className="w-full accent-eco-green"
                  />
                  <p className="mt-1 text-xs text-gray-400">{timerMinutes} minutos</p>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-eco-green py-2.5 font-semibold text-white transition hover:bg-eco-lightgreen"
            >
              Guardar y cerrar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}