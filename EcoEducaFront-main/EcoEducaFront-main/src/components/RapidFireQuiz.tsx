import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Timer, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface RapidFireQuestion {
  statement: string;
  isTrue: boolean;
}

interface Props {
  topicId: string;
  topicTitle: string;
  onComplete?: (correct: number, total: number) => void;
}

function generateQuestions(topicTitle: string): RapidFireQuestion[] {
  // Generate topic-relevant true/false questions from title keywords
  const keywords = topicTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const questions: RapidFireQuestion[] = [
    { statement: `${topicTitle} es un tema importante para aprender.`, isTrue: true },
    { statement: `En "${topicTitle}" no hay conceptos que memorizar.`, isTrue: false },
    { statement: `Practicar con flashcards ayuda a aprender sobre ${topicTitle}.`, isTrue: true },
    { statement: `Este tema no tiene relación con otros temas del curso.`, isTrue: false },
    { statement: `Entender "${topicTitle}" requiere leer con atención.`, isTrue: true },
  ];
  return questions;
}

export default function RapidFireQuiz({ topicId, topicTitle, onComplete }: Props) {
  const [questions] = useState<RapidFireQuestion[]>(() => generateQuestions(topicTitle));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(5).fill(null));
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
  const [correctCount, setCorrectCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = useCallback(() => {
    setGameState("playing");
    setCurrentIndex(0);
    setAnswers(Array(questions.length).fill(null));
    setCorrectCount(0);
    setTimeLeft(15);
  }, [questions.length]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  const handleAnswer = useCallback(
    (answer: boolean) => {
      if (gameState !== "playing") return;
      const isCorrect = questions[currentIndex].isTrue === answer;
      const newAnswers = [...answers];
      newAnswers[currentIndex] = answer;
      setAnswers(newAnswers);
      if (isCorrect) setCorrectCount((prev) => prev + 1);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setGameState("finished");
        setTimeout(() => onComplete?.(correctCount + (isCorrect ? 1 : 0), questions.length), 500);
      }
    },
    [gameState, currentIndex, questions, answers, correctCount, onComplete]
  );

  const currentQ = questions[currentIndex];
  const timePct = (timeLeft / 15) * 100;

  if (gameState === "ready") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center">
        <Zap className="h-16 w-16 text-orange-500" />
        <h3 className="mt-4 text-xl font-bold text-orange-800">Quiz Rápido</h3>
        <p className="mt-2 text-sm text-orange-600">
          Responde {questions.length} preguntas de Verdadero/Falso en {15} segundos
        </p>
        <button
          onClick={startGame}
          className="mt-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
        >
          ¡Comenzar!
        </button>
      </div>
    );
  }

  if (gameState === "finished") {
    const finalCorrect = answers.filter((a, i) => a === questions[i]?.isTrue).length;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center"
      >
        <Zap className="mx-auto h-16 w-16 text-orange-500" />
        <h3 className="mt-4 text-xl font-bold text-orange-800">¡Tiempo terminado!</h3>
        <p className="mt-2 text-lg font-bold text-orange-700">
          {finalCorrect} de {questions.length} correctas
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full ${answers[i] === questions[i]?.isTrue ? "bg-green-500" : "bg-red-400"}`}
            />
          ))}
        </div>
        <button
          onClick={startGame}
          className="mt-4 flex items-center gap-2 mx-auto rounded-xl bg-orange-500 px-6 py-2 font-semibold text-white transition hover:bg-orange-600"
        >
          <RotateCcw className="h-4 w-4" /> Intentar de nuevo
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timer bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Timer className="h-3.5 w-3.5 text-orange-500" />
            {timeLeft}s
          </span>
          <span>Pregunta {currentIndex + 1} de {questions.length}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
            animate={{ width: `${timePct}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        {currentQ && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <p className="text-center text-lg font-semibold text-gray-800">
              {currentQ.statement}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAnswer(true)}
          className={`flex flex-col items-center gap-2 rounded-2xl border-4 py-6 text-xl font-bold transition ${
            answers[currentIndex] === true
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-green-300 bg-green-50 text-green-600 hover:border-green-400"
          }`}
        >
          <CheckCircle2 className="h-8 w-8" />
          Verdadero
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAnswer(false)}
          className={`flex flex-col items-center gap-2 rounded-2xl border-4 py-6 text-xl font-bold transition ${
            answers[currentIndex] === false
              ? "border-red-500 bg-red-50 text-red-700"
              : "border-red-300 bg-red-50 text-red-600 hover:border-red-400"
          }`}
        >
          <XCircle className="h-8 w-8" />
          Falso
        </motion.button>
      </div>

      {/* Live score */}
      <div className="flex justify-center gap-4 text-sm">
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="h-4 w-4" /> {correctCount}
        </span>
        <span className="flex items-center gap-1 text-red-500">
          <XCircle className="h-4 w-4" /> {currentIndex - correctCount}
        </span>
      </div>
    </div>
  );
}
