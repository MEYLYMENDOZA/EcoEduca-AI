import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import AppHeader from "../components/AppHeader";
import TopicWizard from "../components/TopicWizard";

interface TopicDetail {
  id: string;
  title: string;
  courseId: string;
  quizzes: {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string | null;
  }[];
}

// Vista del tema: Experiencia Guiada en 3 Pasos (Wizard)
// Paso 1: Exploración (Aprende)
// Paso 2: Práctica Interactiva (Repasa) - Flashcards + Match Game
// Paso 3: Cuestionario Reto (Demuestra lo aprendido)
export default function TopicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/topics/${id}`)
      .then(({ data }) => setTopic(data.topic))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBackToCourse = () => {
    if (topic?.courseId) {
      navigate(`/cursos/${topic.courseId}`);
    } else {
      navigate("/dashboard");
    }
  };

  const handleNextTopic = () => {
    // Reload the page to go to the next topic (the backend recommends the next one)
    // In a more advanced implementation, we'd navigate to the next topic ID
    if (topic?.courseId) {
      navigate(`/cursos/${topic.courseId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader subtitle={user?.fullName || ""} />

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-12 w-12 text-eco-accent" />
            </motion.div>
            <span className="ml-4 text-gray-400">Cargando tema...</span>
          </div>
        )}

        {!loading && !topic && (
          <div className="text-center py-20">
            <p className="text-gray-400">Tema no encontrado.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 text-eco-green hover:underline"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {topic && (
          <>
            {/* Back link */}
            <button
              onClick={handleBackToCourse}
              className="flex items-center gap-1 text-sm text-eco-green hover:underline"
            >
              ← Volver al curso
            </button>

            {/* Topic title */}
            <div>
              <h2 className="text-2xl font-bold text-eco-green">{topic.title}</h2>
              <p className="mt-1 text-sm text-gray-400">
                Sigue los pasos para aprender, practicar y demostrar lo aprendido
              </p>
            </div>

            {/* Topic Wizard - 3 Step Experience */}
            <TopicWizard
              topicId={topic.id}
              courseId={topic.courseId}
              topicTitle={topic.title}
              quizzes={topic.quizzes}
              accessProfile={user?.accessProfile || "STANDARD"}
              onBackToCourse={handleBackToCourse}
              onNextTopic={handleNextTopic}
            />
          </>
        )}
      </main>
    </div>
  );
}