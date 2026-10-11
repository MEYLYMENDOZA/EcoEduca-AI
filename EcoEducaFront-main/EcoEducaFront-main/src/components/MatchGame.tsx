import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, CheckCircle2, RefreshCw } from "lucide-react";

interface MatchPair {
  id: string;
  term: string;
  definition: string;
}

interface Props {
  pairs: MatchPair[];
  onComplete?: () => void;
}

type CardType = "term" | "definition";

interface CardState {
  id: string;
  pairId: string;
  text: string;
  type: CardType;
  matched: boolean;
  selected: boolean;
}

export default function MatchGame({ pairs, onComplete }: Props) {
  const [cards, setCards] = useState<CardState[]>(() => initializeCards(pairs));
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showError, setShowError] = useState(false);

  function initializeCards(pairList: MatchPair[]): CardState[] {
    const termCards: CardState[] = pairList.map((p) => ({
      id: `term-${p.id}`,
      pairId: p.id,
      text: p.term,
      type: "term" as CardType,
      matched: false,
      selected: false,
    }));
    const defCards: CardState[] = pairList.map((p) => ({
      id: `def-${p.id}`,
      pairId: p.id,
      text: p.definition,
      type: "definition" as CardType,
      matched: false,
      selected: false,
    }));
    // Shuffle cards
    const allCards = [...termCards, ...defCards];
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    return allCards;
  }

  const handleCardClick = useCallback(
    (cardId: string) => {
      const card = cards.find((c) => c.id === cardId);
      if (!card || card.matched) return;

      if (selectedCard === null) {
        setSelectedCard(cardId);
        setCards((prev) =>
          prev.map((c) => (c.id === cardId ? { ...c, selected: true } : c))
        );
        return;
      }

      // Second card selected
      const firstCard = cards.find((c) => c.id === selectedCard);
      if (!firstCard || firstCard.id === cardId) return;

      setAttempts((prev) => prev + 1);

      // Check if they match (same pairId, different types)
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

        if (newMatched === pairs.length) {
          setTimeout(() => onComplete?.(), 600);
        }
      } else {
        // No match
        setShowError(true);
        setCards((prev) =>
          prev.map((c) =>
            c.id === cardId ? { ...c, selected: true } : c
          )
        );
        setTimeout(() => {
          setShowError(false);
          setCards((prev) =>
            prev.map((c) => ({ ...c, selected: false }))
          );
          setSelectedCard(null);
        }, 800);
      }
    },
    [cards, selectedCard, matchedCount, pairs.length, onComplete]
  );

  const reset = () => {
    setCards(initializeCards(pairs));
    setSelectedCard(null);
    setMatchedCount(0);
    setAttempts(0);
    setShowError(false);
  };

  const isComplete = matchedCount === pairs.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Shuffle className="h-4 w-4" /> {pairs.length} pares
          </span>
          <span>Intentos: {attempts}</span>
          {isComplete && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-green-600 font-semibold"
            >
              <CheckCircle2 className="h-4 w-4" /> ¡Completado!
            </motion.span>
          )}
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reiniciar
        </button>
      </div>

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
            disabled={card.matched}
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
            <span className="text-xs">
              {card.type === "term" ? "📖" : "📝"}
            </span>
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