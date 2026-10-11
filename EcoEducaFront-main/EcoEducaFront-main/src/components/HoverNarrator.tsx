import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Pause, Play, SkipBack, SkipForward, Mic } from "lucide-react";
import { useAccessibilitySettings } from "../store/accessibilitySettings";

interface Props {
  blocks: string[];
  onComplete?: () => void;
}

export default function HoverNarrator({ blocks, onComplete }: Props) {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [readingQueue, setReadingQueue] = useState<number[]>([]);
  const { voiceRate } = useAccessibilitySettings();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      synthRef.current?.cancel();
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Speak the current block
  const speakBlock = useCallback(
    (index: number) => {
      if (!synthRef.current || index < 0 || index >= blocks.length) return;
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(blocks[index]);
      utterance.lang = "es-PE";
      utterance.rate = voiceRate;
      utterance.onstart = () => {
        setSpeaking(true);
        setCurrentBlock(index);
      };
      utterance.onend = () => {
        setSpeaking(false);
        setPaused(false);
        // Process queue
        setReadingQueue((prev) => {
          if (prev.length > 0) {
            const next = prev[0];
            setTimeout(() => speakBlock(next), 100);
            return prev.slice(1);
          }
          return prev;
        });
      };
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [blocks, voiceRate]
  );

  // Hover-to-read with 300ms debounce
  const handleHover = useCallback(
    (index: number) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        if (speaking) {
          // Queue if already speaking
          setReadingQueue((prev) => {
            if (!prev.includes(index) && prev.length < 3) {
              return [...prev, index];
            }
            return prev;
          });
        } else {
          speakBlock(index);
        }
      }, 300);
    },
    [speaking, speakBlock]
  );

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const togglePause = useCallback(() => {
    if (!synthRef.current) return;
    if (paused) {
      synthRef.current.resume();
      setPaused(false);
    } else {
      synthRef.current.pause();
      setPaused(true);
    }
  }, [paused]);

  const stopAll = useCallback(() => {
    synthRef.current?.cancel();
    setSpeaking(false);
    setPaused(false);
    setReadingQueue([]);
  }, []);

  const goToBlock = useCallback(
    (direction: "prev" | "next") => {
      stopAll();
      const newIndex =
        direction === "prev"
          ? Math.max(0, currentBlock - 1)
          : Math.min(blocks.length - 1, currentBlock + 1);
      setCurrentBlock(newIndex);
      setTimeout(() => speakBlock(newIndex), 200);
    },
    [currentBlock, blocks.length, speakBlock, stopAll]
  );

  // Check if all blocks have been read
  const progress = blocks.length > 0 ? ((currentBlock + 1) / blocks.length) * 100 : 0;

  return (
    <div className="relative min-h-[60vh] select-none">
      {/* Zone Navigation Overlay - invisible hot zones */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {/* Left zone: previous */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1/4 pointer-events-auto cursor-pointer"
          onMouseEnter={() => goToBlock("prev")}
          title="Zona izquierda: anterior"
        />
        {/* Right zone: next */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/4 pointer-events-auto cursor-pointer"
          onMouseEnter={() => goToBlock("next")}
          title="Zona derecha: siguiente"
        />
        {/* Center zone: play/pause */}
        <div
          className="absolute left-1/4 right-1/4 top-0 bottom-0 pointer-events-auto cursor-pointer"
          onClick={togglePause}
          title="Zona central: reproducir/pausar"
        />
      </div>

      {/* Content area */}
      <div className="relative z-20 pointer-events-none">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between rounded-xl bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <Volume2 className="h-6 w-6 text-amber-600" />
            <div>
              <p className="font-bold text-amber-800">Modo Auditivo</p>
              <p className="text-sm text-amber-600">
                Pasa el cursor sobre el texto para escuchar. Usa las zonas laterales para navegar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePause}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 text-amber-700 transition hover:bg-amber-300"
              aria-label={paused ? "Reanudar" : "Pausar"}
            >
              {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </button>
            <button
              onClick={stopAll}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 text-amber-700 transition hover:bg-amber-300"
              aria-label="Detener"
            >
              <VolumeX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="mb-1 flex justify-between text-xs text-amber-600">
            <span>Sección {currentBlock + 1} de {blocks.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Reading queue indicator */}
        {readingQueue.length > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            <Mic className="h-4 w-4" />
            <span>En cola: {readingQueue.length} párrafo(s) por leer</span>
          </div>
        )}

        {/* Content blocks - hover to read */}
        <div className="space-y-4">
          {blocks.map((block, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`pointer-events-auto rounded-2xl p-6 transition-all cursor-pointer ${
                i === currentBlock
                  ? "bg-gradient-to-r from-amber-100 to-orange-100 ring-2 ring-amber-300 shadow-lg"
                  : "bg-white shadow-sm hover:shadow-md hover:bg-amber-50"
              }`}
              onMouseEnter={() => handleHover(i)}
              onMouseLeave={handleMouseLeave}
              onClick={() => speakBlock(i)}
            >
              <p className={`text-lg leading-relaxed ${i === currentBlock ? "text-amber-900 font-semibold" : "text-gray-700"}`}>
                {block}
              </p>
              {i === currentBlock && speaking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 text-sm text-amber-600"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Volume2 className="h-4 w-4" />
                  </motion.div>
                  <span>Reproduciendo...</span>
                  <div className="ml-2 flex gap-1">
                    {[0, 1, 2].map((dot) => (
                      <motion.div
                        key={dot}
                        className="h-1.5 w-1.5 rounded-full bg-amber-500"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Navigation buttons (visible alternative to zones) */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => goToBlock("prev")}
            disabled={currentBlock === 0}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 transition hover:bg-amber-200 disabled:opacity-30"
            aria-label="Anterior"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={togglePause}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg transition hover:bg-amber-600"
            aria-label={paused ? "Reproducir" : "Pausar"}
          >
            {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
          </button>
          <button
            onClick={() => goToBlock("next")}
            disabled={currentBlock === blocks.length - 1}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 transition hover:bg-amber-200 disabled:opacity-30"
            aria-label="Siguiente"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Zone indicators (subtle) */}
        <div className="mt-4 flex justify-between text-xs text-amber-400">
          <span>← Zona izquierda: anterior</span>
          <span>Zona central: pausa/play</span>
          <span>Zona derecha: siguiente →</span>
        </div>
      </div>
    </div>
  );
}
