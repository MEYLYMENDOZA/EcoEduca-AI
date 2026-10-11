import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { ArrowUpDown, CheckCircle2, RefreshCw, Sparkles, GripVertical, Clock } from "lucide-react";
import apiClient from "../api/client";

interface TimelineEvent {
  id: string;
  label: string;
  order: number;
}

interface Props {
  topicId: string;
  onComplete?: (correct: boolean, attempts: number) => void;
}

export default function TimelineSort({ topicId, onComplete }: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [shuffled, setShuffled] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/topics/${topicId}/timeline`)
      .then(({ data }) => {
        const evts: TimelineEvent[] = data.timeline;
        setEvents(evts);
        // Shuffle for display
        const shuffledCopy = [...evts];
        for (let i = shuffledCopy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledCopy[i], shuffledCopy[j]] = [shuffledCopy[j], shuffledCopy[i]];
        }
        setShuffled(shuffledCopy);
      })
      .catch(() => {
        const fallback: TimelineEvent[] = [
          { id: "t1", label: "Evento inicial del tema", order: 0 },
          { id: "t2", label: "Desarrollo del proceso", order: 1 },
          { id: "t3", label: "Resultado o consecuencia", order: 2 },
        ];
        setEvents(fallback);
        setShuffled([...fallback].sort(() => Math.random() - 0.5));
      })
      .finally(() => setLoading(false));
  }, [topicId]);

  const checkOrder = useCallback(() => {
    setAttempts((prev) => prev + 1);
    const correct = shuffled.every((evt, idx) => evt.order === idx);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setTimeout(() => onComplete?.(true, attempts + 1), 1000);
    } else {
      setTimeout(() => setShowFeedback(false), 2000);
    }
  }, [shuffled, attempts, onComplete]);

  const reset = () => {
    const shuffledCopy = [...events].sort(() => Math.random() - 0.5);
    setShuffled(shuffledCopy);
    setAttempts(0);
    setIsCorrect(false);
    setShowFeedback(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Clock className="h-8 w-8 text-eco-accent" />
        </motion.div>
        <span className="ml-3 text-gray-400">Cargando línea de tiempo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <ArrowUpDown className="mr-1 inline h-4 w-4" />
          Arrastra los eventos al orden cronológico correcto
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Intentos: {attempts}</span>
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:border-gray-300"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Mezclar
          </button>
        </div>
      </div>

      {/* Timeline visual */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-eco-green via-eco-accent to-eco-lightgreen rounded-full" />

        {/* Draggable events */}
        <Reorder.Group axis="y" values={shuffled} onReorder={setShuffled} className="space-y-3 ml-12">
          <AnimatePresence>
            {shuffled.map((evt, idx) => (
              <Reorder.Item
                key={evt.id}
                value={evt}
                className={`relative flex items-center gap-3 rounded-xl border-2 bg-white p-4 shadow-sm transition-all cursor-grab active:cursor-grabbing ${
                  showFeedback
                    ? evt.order === idx
                      ? "border-green-400 bg-green-50"
                      : "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-eco-lightgreen hover:shadow-md"
                }`}
                whileDrag={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
              >
                <GripVertical className="h-5 w-5 shrink-0 text-gray-400" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${showFeedback && evt.order === idx ? "text-green-700" : showFeedback ? "text-red-700" : "text-gray-700"}`}>
                    {evt.label}
                  </p>
                </div>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  showFeedback
                    ? evt.order === idx
                      ? "bg-green-200 text-green-700"
                      : "bg-red-200 text-red-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {idx + 1}
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
              isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">¡Orden correcto! 🎉</span>
              </>
            ) : (
              <>
                <span className="font-semibold">Algunos eventos están en posición incorrecta. Revisa los números rojos.</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={checkOrder}
          disabled={showFeedback}
          className="rounded-xl bg-gradient-to-r from-eco-green to-eco-lightgreen px-8 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
        >
          Verificar orden
        </button>
      </div>
    </div>
  );
}
