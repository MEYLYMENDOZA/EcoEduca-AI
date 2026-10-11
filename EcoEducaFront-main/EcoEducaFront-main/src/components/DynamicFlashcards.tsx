import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Volume2, RotateCcw, CheckCircle2, RefreshCw, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import apiClient from "../api/client";
import { AccessProfile } from "../store/authStore";
import { useAccessibilitySettings } from "../store/accessibilitySettings";

interface FlashcardData {
  front: string;
  back: string;
}

interface Props {
  topicId: string;
  accessProfile: AccessProfile;
  onSpeak?: (text: string) => void;
}

type SwipeDirection = "left" | "right" | null;

export default function DynamicFlashcards({ topicId, accessProfile, onSpeak }: Props) {
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learned, setLearned] = useState<Set<number>>(new Set());
  const [toReview, setToReview] = useState<Set<number>>(new Set());
  const { voiceRate } = useAccessibilitySettings();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const cardOpacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  const learnedOpacity = useTransform(x, [50, 150], [0, 1]);
  const reviewOpacity = useTransform(x, [-150, -50], [0, 1]);

  const isAutoAudio = accessProfile === "AUDITORY" || accessProfile === "DYSLEXIA";

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/topics/${topicId}/flashcards`)
      .then(({ data }) => setCards(data.flashcards))
      .catch(() => {
        // Fallback
        setCards([
          { front: "¿Qué aprenderás en este tema?", back: "Explora el contenido del tema" },
          { front: "Concepto clave", back: "Repasa los conceptos clave" },
          { front: "¿Listo para el reto?", back: "Demuestra lo que has aprendido" },
        ]);
      })
      .finally(() => setLoading(false));
  }, [topicId]);

  // Auto-audio on flip for AUDITORY/DYSLEXIA
  useEffect(() => {
    if (flipped && isAutoAudio && onSpeak && cards[currentIndex]) {
      const t = setTimeout(() => onSpeak(cards[currentIndex].back), 300);
      return () => clearTimeout(t);
    }
  }, [flipped, currentIndex, isAutoAudio, onSpeak, cards]);

  const currentCard = cards[currentIndex];

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (direction === "right") {
        // "Lo sé" ✅
        setLearned((prev) => new Set(prev).add(currentIndex));
      } else if (direction === "left") {
        // "Repasar después" 🔄
        setToReview((prev) => new Set(prev).add(currentIndex));
      }

      setFlipped(false);
      x.set(0);

      // Advance to next card
      if (currentIndex < cards.length - 1) {
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
      }
    },
    [currentIndex, cards.length, x]
  );

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const threshold = 100;
      if (info.offset.x > threshold) {
        handleSwipe("right");
      } else if (info.offset.x < -threshold) {
        handleSwipe("left");
      } else {
        x.set(0);
      }
    },
    [handleSwipe, x]
  );

  const progress = cards.length > 0 ? ((learned.size + toReview.size) / cards.length) * 100 : 0;
  const isComplete = learned.size + toReview.size >= cards.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Sparkles className="h-8 w-8 text-eco-accent" />
        </motion.div>
        <span className="ml-3 text-gray-400">Generando flashcards del tema...</span>
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center"
      >
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h3 className="mt-4 text-xl font-bold text-green-800">¡Flashcards completadas!</h3>
        <p className="mt-2 text-sm text-green-600">
          Aprendidas: {learned.size} · Para repasar: {toReview.size}
        </p>
        <button
          onClick={() => {
            setLearned(new Set());
            setToReview(new Set());
            setCurrentIndex(0);
            setFlipped(false);
          }}
          className="mt-4 flex items-center gap-2 mx-auto rounded-xl bg-green-500 px-6 py-2 font-semibold text-white transition hover:bg-green-600"
        >
          <RefreshCw className="h-4 w-4" /> Repetir
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Tarjeta {currentIndex + 1} de {cards.length}</span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-4 w-4" /> {learned.size}
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <RefreshCw className="h-4 w-4" /> {toReview.size}
          </span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Swipe instruction */}
      <p className="text-center text-xs text-gray-400">
        ← Desliza a la izquierda para repasar después · Desliza a la derecha si lo sabes →
      </p>

      {/* Card Stack */}
      <div className="relative mx-auto h-64 w-full max-w-sm sm:h-72">
        <AnimatePresence mode="popLayout">
          {currentCard && (
            <motion.div
              key={currentIndex}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{ x, rotate, opacity: cardOpacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              whileTap={{ scale: 1.02 }}
            >
              {/* Card */}
              <motion.div
                className="relative h-full w-full"
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
                onClick={() => setFlipped(!flipped)}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-eco-green to-eco-lightgreen p-6 text-white shadow-xl"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <p className="text-center text-lg font-bold leading-relaxed sm:text-xl">
                    {currentCard.front}
                  </p>
                  <p className="mt-4 text-xs text-white/60">Toca para voltear</p>

                  {/* Swipe indicators */}
                  <motion.div
                    className="absolute right-4 top-4 rounded-full bg-green-500 p-2 opacity-0"
                    style={{ opacity: learnedOpacity }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </motion.div>
                  <motion.div
                    className="absolute left-4 top-4 rounded-full bg-amber-500 p-2 opacity-0"
                    style={{ opacity: reviewOpacity }}
                  >
                    <RefreshCw className="h-6 w-6 text-white" />
                  </motion.div>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-xl"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <p className="text-center text-base leading-relaxed text-gray-700 sm:text-lg">
                    {currentCard.back}
                  </p>
                  <div className="mt-4 flex gap-2">
                    {onSpeak && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSpeak(currentCard.back);
                        }}
                        className="flex items-center gap-1 rounded-full bg-eco-green/10 px-3 py-1.5 text-xs font-semibold text-eco-green transition hover:bg-eco-green/20"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> Escuchar
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlipped(false);
                      }}
                      className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-200"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Voltear
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation buttons (alternative to swipe) */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleSwipe("left")}
          className="flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
        >
          <ChevronLeft className="h-4 w-4" /> Repasar
        </button>
        <button
          onClick={() => handleSwipe("right")}
          className="flex items-center gap-2 rounded-xl border-2 border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
        >
          Lo sé <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
