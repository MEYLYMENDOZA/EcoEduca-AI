import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Brain,
  Swords,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Sparkles,
  Lightbulb,
  Eye,
  Headphones,
  Hand,
  Zap,
  Clock,
  Network,
  Search,
} from "lucide-react";
import apiClient from "../api/client";
import { AccessProfile } from "../store/authStore";
import { useAccessibilitySettings } from "../store/accessibilitySettings";
import DynamicFlashcards from "./DynamicFlashcards";
import EnhancedMatchGame from "./EnhancedMatchGame";
import TimelineSort from "./TimelineSort";
import RapidFireQuiz from "./RapidFireQuiz";
import WordCloud from "./WordCloud";
import ConceptMap from "./ConceptMap";
import HoverNarrator from "./HoverNarrator";
import VisualExperience from "./VisualExperience";
import VoiceNavigator from "./VoiceNavigator";
import VictoryCelebration from "./VictoryCelebration";
import LiveGlossary from "./LiveGlossary";

interface QuizItem {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string | null;
}

interface AdaptedContent {
  type: AccessProfile;
  blocks: string[];
  ttsText?: string;
}

interface GlossaryEntry {
  word: string;
  meaning: string;
  pictogram?: string;
}

interface Props {
  topicId: string;
  courseId: string;
  topicTitle: string;
  quizzes: QuizItem[];
  accessProfile: AccessProfile;
  onBackToCourse: () => void;
  onNextTopic?: () => void;
}

type Step = "explore" | "practice" | "quiz";
type PracticeMode = "flashcards" | "match" | "timeline" | "rapidfire" | "wordcloud" | "conceptmap" | null;

const STEP_CONFIG: Record<Step, { icon: React.ReactNode; label: string; color: string }> = {
  explore: {
    icon: <BookOpen className="h-5 w-5" />,
    label: "Exploración",
    color: "bg-blue-500",
  },
  practice: {
    icon: <Brain className="h-5 w-5" />,
    label: "Práctica",
    color: "bg-purple-500",
  },
  quiz: {
    icon: <Swords className="h-5 w-5" />,
    label: "Cuestionario",
    color: "bg-amber-500",
  },
};

const PRACTICE_ACTIVITIES: {
  id: PracticeMode;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  profiles: AccessProfile[] | "all";
}[] = [
  {
    id: "flashcards",
    label: "Tarjetas de Repaso",
    icon: "🃏",
    description: "Voltea tarjetas para repasar conceptos",
    color: "border-purple-200 hover:border-purple-400",
    profiles: "all",
  },
  {
    id: "match",
    label: "Emparejar Conceptos",
    icon: "🎯",
    description: "Une términos con definiciones",
    color: "border-emerald-200 hover:border-emerald-400",
    profiles: "all",
  },
  {
    id: "timeline",
    label: "Ordenar Secuencia",
    icon: "⏳",
    description: "Arrastra eventos al orden correcto",
    color: "border-blue-200 hover:border-blue-400",
    profiles: "all",
  },
  {
    id: "rapidfire",
    label: "Quiz Rápido",
    icon: "⚡",
    description: "Verdadero/Falso contrarreloj",
    color: "border-orange-200 hover:border-orange-400",
    profiles: ["MOTOR", "ADHD", "STANDARD"],
  },
  {
    id: "wordcloud",
    label: "Nube de Conceptos",
    icon: "☁️",
    description: "Encuentra el intruso en la nube",
    color: "border-cyan-200 hover:border-cyan-400",
    profiles: ["VISUAL", "STANDARD", "ADVANCED"],
  },
  {
    id: "conceptmap",
    label: "Mapa Conceptual",
    icon: "🕸️",
    description: "Conecta conceptos relacionados",
    color: "border-indigo-200 hover:border-indigo-400",
    profiles: ["VISUAL", "STANDARD", "ADVANCED"],
  },
];

export default function TopicWizard({
  topicId,
  courseId,
  topicTitle,
  quizzes,
  accessProfile,
  onBackToCourse,
  onNextTopic,
}: Props) {
  const [currentStep, setCurrentStep] = useState<Step>("explore");
  const [content, setContent] = useState<AdaptedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const { voiceRate, autoNarration } = useAccessibilitySettings();
  const hasAutoNarrated = useRef(false);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{
    isCorrect: boolean;
    correctOpt: string;
    explanation: string | null;
  } | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // Victory state
  const [showVictory, setShowVictory] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);

  // Practice state
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null);

  // Load adapted content
  useEffect(() => {
    setLoading(true);
    hasAutoNarrated.current = false;
    apiClient
      .get(`/topics/${topicId}/adapt`)
      .then(({ data }) => {
        setContent(data.content);
      })
      .finally(() => setLoading(false));

    return () => window.speechSynthesis?.cancel();
  }, [topicId]);

  // Auto-narration for AUDITORY profile
  useEffect(() => {
    if (
      accessProfile === "AUDITORY" &&
      content &&
      autoNarration &&
      !hasAutoNarrated.current &&
      currentStep === "explore"
    ) {
      hasAutoNarrated.current = true;
      const t = setTimeout(() => speak(content.ttsText || content.blocks.join(". ")), 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, accessProfile, autoNarration, currentStep]);

  function speak(text?: string) {
    const finalText = text || content?.ttsText || content?.blocks.join(". ");
    if (!finalText || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(finalText);
    utterance.lang = "es-PE";
    utterance.rate = voiceRate;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  // Quiz handlers
  type Letter = "A" | "B" | "C";

  async function handleQuizAnswer(letter: Letter) {
    if (selectedAnswer) return;
    setSelectedAnswer(letter);
    setQuizLoading(true);

    try {
      const { data } = await apiClient.post(`/quizzes/${quizzes[currentQuizIndex].id}/respond`, {
        selectedOpt: letter,
      });
      setQuizResult(data);
      setQuizResults((prev) => ({ ...prev, [quizzes[currentQuizIndex].id]: data.isCorrect }));
    } catch {
      setQuizResult({ isCorrect: false, correctOpt: letter, explanation: null });
      setQuizResults((prev) => ({ ...prev, [quizzes[currentQuizIndex].id]: false }));
    } finally {
      setQuizLoading(false);
    }
  }

  function goToNextQuestion() {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuizResult(null);
    } else {
      const correctCount = Object.values(quizResults).filter(Boolean).length;
      const totalQuizzes = quizzes.length;

      apiClient.get("/profile/stats").then(({ data }) => {
        const newlyAchieved = data.badges.filter(
          (b: { achieved: boolean; label: string }) => b.achieved
        );
        if (newlyAchieved.length > 0) {
          setNewBadge(newlyAchieved[newlyAchieved.length - 1]?.label || null);
        }
      });

      setShowVictory(true);
    }
  }

  const totalQuizzes = quizzes.length;
  const answeredCount = Object.keys(quizResults).length;
  const correctCount = Object.values(quizResults).filter(Boolean).length;
  const xpEarned = correctCount * 10 + (answeredCount - correctCount) * 2;

  // Filter practice activities based on profile
  const availableActivities = PRACTICE_ACTIVITIES.filter(
    (a) => a.profiles === "all" || a.profiles.includes(accessProfile)
  );

  const currentQuiz = quizzes[currentQuizIndex];
  const options: { letter: Letter; text: string }[] = currentQuiz
    ? [
        { letter: "A", text: currentQuiz.optionA },
        { letter: "B", text: currentQuiz.optionB },
        ...(currentQuiz.optionC ? [{ letter: "C" as Letter, text: currentQuiz.optionC }] : []),
      ]
    : [];

  // Render explore step based on profile
  function renderExploreStep() {
    if (!content) return null;

    // AUDITORY: Use HoverNarrator
    if (accessProfile === "AUDITORY") {
      return (
        <HoverNarrator
          blocks={content.blocks}
          onComplete={() => setCurrentStep("practice")}
        />
      );
    }

    // VISUAL: Use VisualExperience
    if (accessProfile === "VISUAL") {
      return (
        <VisualExperience
          blocks={content.blocks}
          topicTitle={topicTitle}
        />
      );
    }

    // MOTOR: Use VoiceNavigator
    if (accessProfile === "MOTOR") {
      return (
        <VoiceNavigator
          blocks={content.blocks}
          topicTitle={topicTitle}
          onComplete={() => setCurrentStep("practice")}
        />
      );
    }

    // STANDARD and others: Use LiveGlossary
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-eco-green">📖 Aprende: {topicTitle}</h3>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          {content.blocks.map((block, i) => (
            <div key={i} className="relative mb-4 last:mb-0">
              <LiveGlossary
                entries={[
                  { word: "aprender", meaning: "Adquirir conocimiento o habilidad", pictogram: "📚" },
                  { word: "practicar", meaning: "Repetir una actividad para mejorar", pictogram: "✏️" },
                  { word: "evaluar", meaning: "Medir el nivel de conocimiento", pictogram: "📝" },
                ]}
                text={block}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render practice step
  function renderPracticeStep() {
    if (!practiceMode) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-eco-green">🧠 Repasa: {topicTitle}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableActivities.map((activity) => (
              <motion.button
                key={activity.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPracticeMode(activity.id)}
                className={`flex flex-col items-center gap-3 rounded-2xl border-2 bg-white p-6 text-center transition hover:shadow-lg ${activity.color}`}
              >
                <span className="text-4xl">{activity.icon}</span>
                <h4 className="text-lg font-bold text-gray-800">{activity.label}</h4>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-eco-green">
            {availableActivities.find((a) => a.id === practiceMode)?.label || "Práctica"}
          </h3>
          <button
            onClick={() => setPracticeMode(null)}
            className="text-sm text-eco-green hover:underline"
          >
            Cambiar actividad
          </button>
        </div>

        {practiceMode === "flashcards" && (
          <DynamicFlashcards
            topicId={topicId}
            accessProfile={accessProfile}
            onSpeak={(text) => speak(text)}
          />
        )}

        {practiceMode === "match" && (
          <EnhancedMatchGame
            topicId={topicId}
            onComplete={(score) => {
              console.log("Match game completed:", score);
            }}
          />
        )}

        {practiceMode === "timeline" && (
          <TimelineSort
            topicId={topicId}
            onComplete={(correct, attempts) => {
              console.log("Timeline completed:", { correct, attempts });
            }}
          />
        )}

        {practiceMode === "rapidfire" && (
          <RapidFireQuiz
            topicId={topicId}
            topicTitle={topicTitle}
            onComplete={(correct, total) => {
              console.log("RapidFire completed:", { correct, total });
            }}
          />
        )}

        {practiceMode === "wordcloud" && (
          <WordCloud
            topicId={topicId}
            onComplete={() => {
              console.log("WordCloud completed");
            }}
          />
        )}

        {practiceMode === "conceptmap" && (
          <ConceptMap
            topicId={topicId}
            onComplete={(correct, total) => {
              console.log("ConceptMap completed:", { correct, total });
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {(["explore", "practice", "quiz"] as Step[]).map((step, i) => {
          const config = STEP_CONFIG[step];
          const isActive = currentStep === step;
          const isCompleted =
            (step === "explore" && currentStep !== "explore") ||
            (step === "practice" && (currentStep === "quiz" || showVictory)) ||
            (step === "quiz" && showVictory);

          return (
            <div key={step} className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => {
                  if (step === "explore") setCurrentStep("explore");
                  if (step === "practice" && currentStep !== "explore") setCurrentStep("practice");
                  if (step === "quiz" && currentStep === "quiz") setCurrentStep("quiz");
                }}
                disabled={step === "practice" && currentStep === "explore"}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:py-2 sm:text-sm ${
                  isActive
                    ? `${config.color} text-white shadow-lg`
                    : isCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : config.icon}
                <span className="hidden sm:inline">{config.label}</span>
              </button>
              {i < 2 && (
                <div
                  className={`h-0.5 w-6 sm:w-12 ${
                    (step === "explore" && currentStep !== "explore") ||
                    (step === "practice" && (currentStep === "quiz" || showVictory))
                      ? "bg-green-400"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* STEP 1: EXPLORE */}
        {currentStep === "explore" && (
          <motion.div
            key="explore"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-8 w-8 text-eco-accent" />
                </motion.div>
                <span className="ml-3 text-gray-400">Preparando contenido...</span>
              </div>
            ) : content ? (
              renderExploreStep()
            ) : (
              <p className="text-gray-400">No hay contenido disponible para este tema.</p>
            )}

            {accessProfile !== "AUDITORY" && accessProfile !== "MOTOR" && (
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep("practice")}
                  className="flex items-center gap-2 rounded-xl bg-eco-green px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-eco-lightgreen"
                >
                  Continuar a práctica <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: PRACTICE */}
        {currentStep === "practice" && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {renderPracticeStep()}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep("explore")}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-600 transition hover:border-gray-300"
              >
                <ChevronLeft className="h-4 w-4" /> Volver
              </button>
              <button
                onClick={() => setCurrentStep("quiz")}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
              >
                Ir al cuestionario <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: QUIZ */}
        {currentStep === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-eco-green">⚔️ Demuestra lo aprendido</h3>
              {accessProfile === "AUDITORY" && currentQuiz && (
                <button
                  onClick={() => {
                    const text = `${currentQuiz.question}. Opciones: ${options.map((o) => o.text).join(", ")}`;
                    speak(text);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-eco-green px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-eco-lightgreen"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Escuchar
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div>
              <div className="mb-1 flex justify-between text-xs text-gray-400">
                <span>
                  Pregunta {Math.min(answeredCount + 1, totalQuizzes)} de {totalQuizzes}
                </span>
                <span>
                  {correctCount} correctas
                  {answeredCount > 0 && ` · ${xpEarned} XP`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(answeredCount / totalQuizzes) * 100}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-eco-accent to-yellow-400"
                />
              </div>
            </div>

            {/* Quiz card - one at a time */}
            {currentQuiz && (
              <motion.div
                key={currentQuiz.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <p className="mb-6 text-lg font-semibold text-gray-800">{currentQuiz.question}</p>

                <div className="grid gap-3">
                  {options.map((o) => {
                    const isCorrectOpt = quizResult && o.letter === quizResult.correctOpt;
                    const isWrongSelection =
                      quizResult && selectedAnswer === o.letter && !quizResult.isCorrect;
                    return (
                      <button
                        key={o.letter}
                        disabled={!!selectedAnswer || quizLoading}
                        onClick={() => handleQuizAnswer(o.letter)}
                        className={`rounded-lg border-2 px-4 py-3 text-left font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-eco-accent/50 disabled:opacity-100 ${
                          isCorrectOpt
                            ? "border-green-500 bg-green-50"
                            : isWrongSelection
                              ? "border-red-400 bg-red-50"
                              : selectedAnswer === o.letter
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

                {/* Feedback */}
                <AnimatePresence>
                  {quizResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 space-y-2"
                    >
                      <p
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                          quizResult.isCorrect
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {quizResult.isCorrect ? (
                          <>✅ ¡Correcto! +10 XP</>
                        ) : (
                          <>❌ Respuesta guardada, sigue practicando. +2 XP</>
                        )}
                      </p>
                      {quizResult.explanation && (
                        <p className="flex items-start gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-gray-600">
                          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-eco-accent" />
                          {quizResult.explanation}
                        </p>
                      )}

                      <button
                        onClick={goToNextQuestion}
                        className="mt-2 w-full rounded-lg bg-eco-green py-2.5 font-semibold text-white transition hover:bg-eco-lightgreen"
                      >
                        {currentQuizIndex < totalQuizzes - 1
                          ? "Siguiente pregunta →"
                          : "Ver resultados 🎉"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {totalQuizzes === 0 && (
              <p className="text-gray-400">Este tema todavía no tiene quizzes disponibles.</p>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep("practice")}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-600 transition hover:border-gray-300"
              >
                <ChevronLeft className="h-4 w-4" /> Volver a práctica
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Celebration */}
      <VictoryCelebration
        open={showVictory}
        onClose={() => setShowVictory(false)}
        xpEarned={xpEarned}
        correctCount={correctCount}
        totalQuestions={totalQuizzes}
        newBadgeUnlocked={newBadge}
        onNextTopic={onNextTopic}
        onBackToCourse={onBackToCourse}
      />
    </div>
  );
}
