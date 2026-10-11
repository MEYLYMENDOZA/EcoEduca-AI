import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, SkipBack, SkipForward, Play, Pause, Mic, MicOff } from "lucide-react";
import { useAccessibilitySettings } from "../store/accessibilitySettings";
import { useVoiceCommands } from "../hooks/useVoiceCommands";

interface Props {
  blocks: string[];
  ttsText?: string;
  onComplete?: () => void;
}

export default function AuditoryContent({ blocks, ttsText, onComplete }: Props) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const { voiceRate } = useAccessibilitySettings();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const fullText = ttsText || blocks.join(". ");

  // Voice commands for navigation
  const { isListening, toggleListening, isSupported } = useVoiceCommands({
    enabled: true,
    lang: "es-PE",
    commands: {
      "siguiente": () => nextBlock(),
      "adelante": () => nextBlock(),
      "anterior": () => prevBlock(),
      "atrás": () => prevBlock(),
      "pausa": () => pauseSpeaking(),
      "reproducir": () => resumeSpeaking(),
      "repetir": () => speakCurrent(),
    },
  });

  function speakCurrent() {
    window.speechSynthesis.cancel();
    const text = blocks[currentBlockIndex] || fullText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-PE";
    utterance.rate = voiceRate;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onpause = () => setPaused(true);
    utterance.onresume = () => setPaused(false);
    window.speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
  }

  function pauseSpeaking() {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function resumeSpeaking() {
    window.speechSynthesis.resume();
    setPaused(false);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }

  function nextBlock() {
    stopSpeaking();
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex((prev) => prev + 1);
      setTimeout(() => speakCurrent(), 200);
    } else {
      onComplete?.();
    }
  }

  function prevBlock() {
    stopSpeaking();
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((prev) => prev - 1);
      setTimeout(() => speakCurrent(), 200);
    }
  }

  // Auto-narrate on mount
  useEffect(() => {
    const t = setTimeout(() => speakCurrent(), 500);
    return () => {
      clearTimeout(t);
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Audio header */}
      <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎧</span>
          <div>
            <p className="font-bold text-amber-800">Modo Auditivo</p>
            <p className="text-sm text-amber-600">
              Contenido narrado automáticamente. Usa comandos de voz o los controles.
            </p>
          </div>
        </div>
      </div>

      {/* Current content display (large text for low vision) */}
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-center text-2xl leading-relaxed text-gray-800 sm:text-3xl">
          {blocks[currentBlockIndex] || fullText}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
        <span>Sección {currentBlockIndex + 1} de {blocks.length}</span>
      </div>

      {/* Audio controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevBlock}
          disabled={currentBlockIndex === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 transition hover:bg-amber-200 disabled:opacity-30"
          aria-label="Anterior"
        >
          <SkipBack className="h-6 w-6" />
        </button>

        <button
          onClick={speaking ? pauseSpeaking : speakCurrent}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg transition hover:bg-amber-600"
          aria-label={speaking ? "Pausar" : "Reproducir"}
        >
          {speaking && !paused ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7" />
          )}
        </button>

        <button
          onClick={nextBlock}
          disabled={currentBlockIndex === blocks.length - 1}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 transition hover:bg-amber-200 disabled:opacity-30"
          aria-label="Siguiente"
        >
          <SkipForward className="h-6 w-6" />
        </button>
      </div>

      {/* Voice command button */}
      {isSupported && (
        <div className="flex justify-center">
          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isListening ? (
              <><MicOff className="h-4 w-4" /> Escuchando...</>
            ) : (
              <><Mic className="h-4 w-4" /> Activar comandos de voz</>
            )}
          </button>
        </div>
      )}

      {/* Voice commands help */}
      <div className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
        <p className="font-semibold text-gray-700">Comandos de voz disponibles:</p>
        <p className="mt-1">
          "Siguiente" · "Anterior" · "Pausa" · "Reproducir" · "Repetir"
        </p>
      </div>
    </div>
  );
}