import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, CheckCircle2, XCircle, Hand, ArrowLeft, ArrowRight, Play, Pause } from "lucide-react";
import { useVoiceCommands } from "../hooks/useVoiceCommands";
import { useAccessibilitySettings } from "../store/accessibilitySettings";

interface Props {
  blocks: string[];
  topicTitle: string;
  onComplete?: () => void;
}

export default function VoiceNavigator({ blocks, topicTitle, onComplete }: Props) {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { voiceRate } = useAccessibilitySettings();
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => { synthRef.current?.cancel(); };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current) return;
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-PE";
      utterance.rate = voiceRate;
      synthRef.current.speak(utterance);
    },
    [voiceRate]
  );

  // Voice commands for MOTOR profile - large zones, voice only
  const { isListening, toggleListening, isSupported } = useVoiceCommands({
    enabled: true,
    lang: "es-PE",
    commands: {
      "siguiente": () => { speak("Siguiente sección"); goNext(); },
      "adelante": () => { speak("Siguiente sección"); goNext(); },
      "anterior": () => { speak("Sección anterior"); goPrev(); },
      "atrás": () => { speak("Sección anterior"); goPrev(); },
      "sí": () => { speak("Confirmado"); handleYes(); },
      "si": () => { speak("Confirmado"); handleYes(); },
      "no": () => { speak("No confirmado"); handleNo(); },
      "repetir": () => { speak("Repitiendo"); speak(blocks[currentBlock]); },
      "escuchar": () => { speak(blocks[currentBlock]); },
    },
  });

  const goNext = useCallback(() => {
    if (currentBlock < blocks.length - 1) {
      setCurrentBlock((prev) => prev + 1);
      setConfirmed(false);
      setShowConfirmation(false);
      setTimeout(() => speak(blocks[currentBlock + 1]), 300);
    } else {
      onComplete?.();
    }
  }, [currentBlock, blocks, speak, onComplete]);

  const goPrev = useCallback(() => {
    if (currentBlock > 0) {
      setCurrentBlock((prev) => prev - 1);
      setConfirmed(false);
      setShowConfirmation(false);
      setTimeout(() => speak(blocks[currentBlock - 1]), 300);
    }
  }, [currentBlock, blocks, speak]);

  const handleYes = useCallback(() => {
    setConfirmed(true);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      goNext();
    }, 1000);
  }, [goNext]);

  const handleNo = useCallback(() => {
    setConfirmed(false);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 1000);
  }, []);

  // Auto-narrate on mount and block change
  useEffect(() => {
    const t = setTimeout(() => speak(blocks[currentBlock]), 500);
    return () => clearTimeout(t);
  }, [currentBlock, blocks, speak]);

  const currentText = blocks[currentBlock];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-8 p-4">
      {/* Header - minimal */}
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
        <Hand className="h-8 w-8" />
        <div>
          <p className="font-bold">Modo Motor</p>
          <p className="text-sm text-green-200">Comandos de voz activos</p>
        </div>
      </div>

      {/* Voice command status */}
      {isSupported && (
        <div className="flex items-center gap-3">
          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            {isListening ? "Escuchando..." : "Activar voz"}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Volume2 className="h-4 w-4" />
            <span>Di: "siguiente", "anterior", "sí", "no", "repetir"</span>
          </div>
        </div>
      )}

      {/* Progress indicator - large visual */}
      <div className="flex items-center gap-3">
        {blocks.map((_, i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full transition-all ${
              i === currentBlock
                ? "bg-green-500 scale-125 ring-4 ring-green-200"
                : i < currentBlock
                  ? "bg-green-300"
                  : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Main content - ONE large card, no scroll */}
      <div className="w-full max-w-lg">
        <motion.div
          key={currentBlock}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-white p-8 shadow-xl"
        >
          {/* Block indicator */}
          <div className="mb-4 flex justify-center">
            <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-bold text-green-700">
              {currentBlock + 1} / {blocks.length}
            </span>
          </div>

          {/* Large text - minimal content, big buttons */}
          <p className="text-center text-2xl leading-relaxed text-gray-800 sm:text-3xl">
            {currentText}
          </p>

          {/* Listen button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => speak(currentText)}
              className="flex items-center gap-2 rounded-full bg-green-100 px-6 py-3 text-green-700 transition hover:bg-green-200"
            >
              <Volume2 className="h-5 w-5" />
              Escuchar
            </button>
          </div>
        </motion.div>
      </div>

      {/* Large action zones - 200px+ touch targets */}
      <div className="grid w-full max-w-lg grid-cols-2 gap-4">
        {/* NO / Previous */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={goPrev}
          disabled={currentBlock === 0}
          className="flex h-32 flex-col items-center justify-center rounded-3xl border-4 border-red-300 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-30"
          style={{ minHeight: "128px" }}
        >
          <ArrowLeft className="h-10 w-10" />
          <span className="mt-2 text-xl font-bold">Anterior</span>
          <span className="text-sm text-red-400">Di "anterior"</span>
        </motion.button>

        {/* YES / Next */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={goNext}
          className="flex h-32 flex-col items-center justify-center rounded-3xl border-4 border-green-300 bg-green-50 text-green-700 transition hover:bg-green-100"
          style={{ minHeight: "128px" }}
        >
          <ArrowRight className="h-10 w-10" />
          <span className="mt-2 text-xl font-bold">Siguiente</span>
          <span className="text-sm text-green-400">Di "siguiente"</span>
        </motion.button>
      </div>

      {/* SÍ/NO confirmation for current block */}
      <div className="w-full max-w-lg">
        <p className="mb-3 text-center text-lg font-semibold text-gray-700">
          ¿Entendiste esta sección?
        </p>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleYes}
            className={`flex h-28 flex-col items-center justify-center rounded-3xl border-4 text-2xl font-bold transition ${
              confirmed
                ? "border-green-500 bg-green-100 text-green-700"
                : "border-green-300 bg-green-50 text-green-600 hover:bg-green-100"
            }`}
            style={{ minHeight: "112px" }}
          >
            <CheckCircle2 className="h-10 w-10" />
            <span>SÍ</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNo}
            className={`flex h-28 flex-col items-center justify-center rounded-3xl border-4 text-2xl font-bold transition ${
              showConfirmation && !confirmed
                ? "border-red-500 bg-red-100 text-red-700"
                : "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
            }`}
            style={{ minHeight: "112px" }}
          >
            <XCircle className="h-10 w-10" />
            <span>NO</span>
          </motion.button>
        </div>
      </div>

      {/* Confirmation feedback */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-lg font-bold ${
              confirmed ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {confirmed ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            {confirmed ? "¡Entendido! Avanzando..." : "Repasaremos esta sección."}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice commands help */}
      <div className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-500">
        <p className="font-bold text-gray-700">Comandos de voz disponibles:</p>
        <p className="mt-1">
          "Siguiente" · "Anterior" · "Sí" · "No" · "Repetir" · "Escuchar"
        </p>
      </div>
    </div>
  );
}
