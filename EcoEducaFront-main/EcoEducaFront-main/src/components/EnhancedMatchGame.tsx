import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, CheckCircle2, RefreshCw, Star, Timer, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import apiClient from "../api/client";

interface MatchPair {
  id: string;
  term: string;
  definition: string;
}

interface Props {
  topicId: string;
  onComplete?: (score: { attempts: number; timeSeconds: number; stars: number }) => void;
}

interface CardState {
  id: string;
  pairId: string;
  text: string;
  type: "term" | "definition";
  matched: boolean;
  selected: boolean;
}

function initializeCards(pairs: MatchPair[]): CardState[] {
  const cards: CardState[] = [];
  for (const p of pairs) {
    cards.push({ id: `term-${p.id}`, pairId: p.id, text: p.term, type: "term", matched: false, selected: false });
    cards.push({ id: `def-${p.id}`, pairId: p.id, text: p.definition, type: "definition", matched: false, selected: false });
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function EnhancedMatchGame({ topicId, onComplete }: Props) {
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [cards, setCards] = useState<CardState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showError, setShowError] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/topics/${topicId}/match-pairs`)
      .then(({ data }) => {
        setPairs(data.pairs);
        setCards(initializeCards(data.pairs));
      })
      .catch(() => {
        const fallback: MatchPair[] = [
          { id: "1", term: "Concepto A", definition: "Definición del concepto A" },
          { id: "2", term: "Concepto B", definition: "Definición del concepto B" },
          { id: "3", term: "Concepto C", definition: "Definición del concepto C" },
        ];
        setPairs(fallback);
        setCards(initializeCards(fallback));
      })
      .finally(() => setLoading(false));
  }, [topicId]);

  // Timer
  useEffect(() => {
    if (startTime && !gameComplete) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, gameComplete]);

  // Start timer on first card click
  const handleCardClick = useCallback(
    (cardId: string) => {
      const card = cards.find((c) => c.id === cardId);
      if (!card || card.matched) return;

      if (!startTime) setStartTime(Date.now());

      if (selectedCard === null) {
        setSelectedCard(cardId);
        setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, selected: true } : c)));
        return;
      }

      const firstCard = cards.find((c) => c.id === selectedCard);
      if (!firstCard || firstCard.id === cardId) return;

      setAttempts((prev) => prev + 1);

      if (firstCard.pairId === card.pairId && firstCard.type !== card.type) {
        // Match!
        const newMatched = matchedCount + 1;
        setMatchedCount(newMatched);
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstCard.id || c.id === cardId
              ? { ...c, matched: true, selected: false }
              : { ...c, selected: false }
          )
        );
        setSelectedCard(null);

        // Confetti on match
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.8 },
          colors: ["#22c55e", "#10b981", "#059669"],
        });

        if (newMatched === pairs.length) {
          setGameComplete(true);
          const time = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
          const stars = attempts <= pairs.length + 1 ? 3 : attempts <= pairs.length * 2 ? 2 : 1;
          setTimeout(() => {
            onComplete?.({ attempts: attempts + 1, timeSeconds: time, stars });
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }, 600);
        }
      } else {
        // No match
        setShowError(true);
        setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, selected: true } : c)));
        setTimeout(() => {
          setShowError(false);
          setCards((prev) => prev.map((c) => ({ ...c, selected: false })));
          setSelectedCard(null);
        }, 800);
      }
    },
    [cards, selectedCard, matchedCount, pairs.length, attempts, startTime, onComplete]
  );

  const reset = () => {
    setCards(initializeCards(pairs));
    setSelectedCard(null);
    setMatchedCount(0);
    setAttempts(0);
    setShowError(false);
    setGameComplete(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  const isComplete = matchedCount === pairs.length && pairs.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Shuffle className="h-8 w-8 text-eco-accent" />
        </motion.div>
        <span className="ml-3 text-gray-400">Cargando pares del tema...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Shuffle className="h-4 w-4" /> {pairs.length} pares
          </span>
          <span>Intentos: {attempts}</span>
          {startTime && (
            <span className="flex items-center gap-1 font-mono">
              <Timer className="h-4 w-4 text-eco-accent" />
              {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, "0")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1"
            >
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${s <= (attempts <= pairs.length + 1 ? 3 : attempts <= pairs.length * 2 ? 2 : 1) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </motion.div>
          )}
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:border-gray-300"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reiniciar
          </button>
        </div>
      </div>

      {/* Completion message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-green-50 border-2 border-green-200 px-4 py-3"
        >
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-800">
            ¡Completado en {attempts} intentos! Tiempo: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, "0")}
          </span>
        </motion.div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotateY: card.matched ? 360 : 0,
            }}
            transition={{ delay: i * 0.03, type: "spring", stiffness: 200 }}
            whileHover={!card.matched ? { scale: 1.03 } : {}}
            whileTap={!card.matched ? { scale: 0.97 } : {}}
            onClick={() => handleCardClick(card.id)}
            disabled={card.matched || isComplete}
            className={`relative flex min-h-[80px] items-center justify-center rounded-xl border-2 p-3 text-center text-sm font-medium transition-all ${
              card.matched
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 cursor-default"
                : card.selected
                  ? showError
                    ? "border-red-400 bg-red-50 text-red-700 animate-shake"
                    : "border-eco-accent bg-amber-50 text-amber-800 ring-2 ring-eco-accent/30"
                  : "border-gray-200 bg-white text-gray-700 hover:border-eco-lightgreen hover:shadow-sm"
            }`}
          >
            <span className="text-xs">{card.type === "term" ? "📖" : "📝"}</span>
            <span className="ml-1 leading-tight">{card.text}</span>
          </motion.button>
        ))}
      </div>

      {/* Instructions */}
      <p className="text-center text-xs text-gray-400">
        Selecciona un término y luego su definición correspondiente para emparejarlos
      </p>
    </div>
  );
}
