import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, Sparkles } from "lucide-react";
import apiClient from "../api/client";

interface KeywordItem {
  word: string;
  weight: number;
  definition?: string;
}

interface Props {
  topicId: string;
  onComplete?: () => void;
}

// Color palette based on weight (importance)
const WEIGHT_COLORS = [
  "text-gray-400",      // 1
  "text-gray-500",      // 2
  "text-gray-600",      // 3
  "text-gray-700",      // 4
  "text-gray-800",      // 5
  "text-blue-600",      // 6
  "text-blue-700",      // 7
  "text-blue-800",      // 8
  "text-indigo-700",    // 9
  "text-indigo-800",    // 10
];

export default function WordCloud({ topicId, onComplete }: Props) {
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<KeywordItem | null>(null);
  const [foundIntruder, setFoundIntruder] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/topics/${topicId}/keywords`)
      .then(({ data }) => {
        // Add one intruder word that doesn't belong
        const intruderWords = ["pizza", "bicicleta", "computadora", "avión", "guitarra", "fútbol", "helado", "televisión"];
        const randomIntruder = intruderWords[Math.floor(Math.random() * intruderWords.length)];
        const items: KeywordItem[] = [
          ...data.keywords,
          { word: randomIntruder, weight: 3, definition: "Esta palabra no pertenece al tema. ¡La encontraste!" },
        ];
        // Shuffle
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [items[i], items[j]] = [items[j], items[i]];
        }
        setKeywords(items);
      })
      .catch(() => {
        const fallback: KeywordItem[] = [
          { word: "aprender", weight: 8, definition: "Adquirir conocimiento o habilidad" },
          { word: "practicar", weight: 6, definition: "Repetir una actividad para mejorar" },
          { word: "evaluar", weight: 7, definition: "Medir el nivel de conocimiento" },
          { word: "pizza", weight: 3, definition: "Esta palabra no pertenece al tema. ¡La encontraste!" },
        ];
        setKeywords(fallback);
      })
      .finally(() => setLoading(false));
  }, [topicId]);

  const handleWordClick = (kw: KeywordItem) => {
    setSelectedWord(kw);
    // Check if it's the intruder (not a real topic word)
    if (kw.definition?.includes("no pertenece")) {
      setFoundIntruder(true);
      setTimeout(() => onComplete?.(), 1500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Sparkles className="h-8 w-8 text-eco-accent" />
        </motion.div>
        <span className="ml-3 text-gray-400">Generando nube de conceptos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <Search className="mr-1 inline h-4 w-4" />
          Encuentra la palabra que NO pertenece al tema
        </p>
        {foundIntruder && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
          >
            ¡Intruso encontrado! 🎉
          </motion.span>
        )}
      </div>

      {/* Word Cloud */}
      <div
        ref={containerRef}
        className="relative flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100 p-6 min-h-[200px]"
      >
        {keywords.map((kw, i) => {
          const fontSize = 12 + kw.weight * 2.2;
          const colorClass = WEIGHT_COLORS[Math.min(kw.weight - 1, WEIGHT_COLORS.length - 1)];
          return (
            <motion.button
              key={kw.word}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 150 }}
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleWordClick(kw)}
              className={`cursor-pointer rounded-lg px-2 py-1 font-bold transition-all hover:bg-white/80 hover:shadow-md ${colorClass}`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {kw.word}
            </motion.button>
          );
        })}
      </div>

      {/* Selected word definition */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="relative"
          >
            <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <h4 className="font-bold text-blue-800 capitalize">{selectedWord.word}</h4>
                </div>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {selectedWord.definition || "Palabra clave del tema."}
              </p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-xs text-gray-400">Importancia:</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${i < selectedWord.weight ? "bg-blue-500" : "bg-gray-200"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <p className="text-center text-xs text-gray-400">
        Haz clic en cualquier palabra para ver su definición. El tamaño indica su importancia en el tema.
      </p>
    </div>
  );
}
