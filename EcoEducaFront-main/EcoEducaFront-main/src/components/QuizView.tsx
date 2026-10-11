import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import apiClient from "../api/client";
import { AccessProfile } from "../store/authStore";
import { useAccessibilitySettings } from "../store/accessibilitySettings";

export interface QuizItem {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string | null;
}

interface Props {
  quiz: QuizItem;
  accessProfile: AccessProfile;
  onAnswered?: (isCorrect: boolean) => void;
}

type Letter = "A" | "B" | "C";

interface RespondResult {
  isCorrect: boolean;
  correctOpt: Letter;
  explanation: string | null;
}

export default function QuizView({ quiz, accessProfile, onAnswered }: Props) {
  const [selected, setSelected] = useState<Letter | null>(null);
  const [result, setResult] = useState<RespondResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { voiceRate } = useAccessibilitySettings();

  const options: { letter: Letter; text: string }[] = [
    { letter: "A", text: quiz.optionA },
    { letter: "B", text: quiz.optionB },
    ...(quiz.optionC ? ([{ letter: "C", text: quiz.optionC }] as const) : []),
  ];

  async function respond(letter: Letter) {
    if (selected) return;
    setSelected(letter);
    setLoading(true);
    try {
      const { data } = await apiClient.post(`/quizzes/${quiz.id}/respond`, {
        selectedOpt: letter,
      });
      setResult(data);
      onAnswered?.(data.isCorrect);
    } catch {
      setResult({ isCorrect: false, correctOpt: letter, explanation: null });
      onAnswered?.(false);
    } finally {
      setLoading(false);
    }
  }

  function speak() {
    if (!("speechSynthesis" in window)) return;
    const text = `${quiz.question}. Opciones: ${options.map((o) => o.text).join(", ")}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-PE";
    utterance.rate = voiceRate;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      {accessProfile === "VISUAL" && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-100 px-4 py-2 text-sm text-yellow-900">
          <Lightbulb className="h-4 w-4 shrink-0" /> Apoyo visual: lee la pregunta con calma. Fíjate en
          las palabras clave.
        </div>
      )}

      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="font-semibold text-gray-800">{quiz.question}</p>
        {accessProfile === "AUDITORY" && (
          <button
            onClick={speak}
            aria-label="Escuchar pregunta en voz alta"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-eco-green px-3 py-2 text-sm font-semibold text-white transition hover:bg-eco-lightgreen focus:outline-none focus-visible:ring-4 focus-visible:ring-eco-accent/50"
          >
            <Volume2 className="h-4 w-4" /> Escuchar
          </button>
        )}
      </div>

      {accessProfile === "MOTOR" ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            disabled={!!selected || loading}
            onClick={() => respond("A")}
            className={`rounded-2xl py-8 text-xl font-bold text-white shadow transition focus:outline-none focus-visible:ring-4 focus-visible:ring-eco-accent/50 disabled:opacity-70 ${
              selected === "A" ? "bg-green-700" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            ✅ SÍ
            <span className="mt-1 block text-sm font-normal">{quiz.optionA}</span>
          </button>
          <button
            disabled={!!selected || loading}
            onClick={() => respond("B")}
            className={`rounded-2xl py-8 text-xl font-bold text-white shadow transition focus:outline-none focus-visible:ring-4 focus-visible:ring-eco-accent/50 disabled:opacity-70 ${
              selected === "B" ? "bg-red-700" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            ❌ NO
            <span className="mt-1 block text-sm font-normal">{quiz.optionB}</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {options.map((o) => {
            const isCorrectOpt = result && o.letter === result.correctOpt;
            const isWrongSelection = result && selected === o.letter && !result.isCorrect;
            return (
              <button
                key={o.letter}
                disabled={!!selected || loading}
                onClick={() => respond(o.letter)}
                className={`rounded-lg border-2 px-4 py-3 text-left font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-eco-accent/50 disabled:opacity-100 ${
                  isCorrectOpt
                    ? "border-green-500 bg-green-50"
                    : isWrongSelection
                      ? "border-red-400 bg-red-50"
                      : selected === o.letter
                        ? "border-eco-green bg-eco-lightgreen/20"
                        : "border-gray-200 hover:border-eco-lightgreen"
                }`}
              >
                <span className="mr-2 font-bold">{o.letter}.</span>
                {o.text}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 space-y-2"
          >
            <p
              role="status"
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                result.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {result.isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> ¡Correcto! +10 XP
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" /> Respuesta guardada, sigue practicando. +2 XP
                </>
              )}
            </p>
            {result.explanation && (
              <p className="flex items-start gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-gray-600">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-eco-accent" />
                {result.explanation}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}