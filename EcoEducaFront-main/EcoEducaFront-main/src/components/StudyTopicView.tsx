import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Sparkles, Lightbulb } from "lucide-react";
import apiClient from "../api/client";
import { AccessProfile } from "../store/authStore";
import { useAccessibilitySettings } from "../store/accessibilitySettings";
import VisualContent from "./VisualContent";
import AuditoryContent from "./AuditoryContent";

interface AdaptedContent {
  type: AccessProfile;
  blocks: string[];
  ttsText?: string;
}

interface Props {
  topicId: string;
  accessProfile: AccessProfile;
}

export default function StudyTopicView({ topicId, accessProfile }: Props) {
  const [content, setContent] = useState<AdaptedContent | null>(null);
  const [cacheHit, setCacheHit] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const hasAutoNarrated = useRef(false);
  const { voiceRate, autoNarration } = useAccessibilitySettings();

  useEffect(() => {
    setLoading(true);
    hasAutoNarrated.current = false;
    apiClient
      .get(`/topics/${topicId}/adapt`)
      .then(({ data }) => {
        setContent(data.content);
        setCacheHit(data.cacheHit);
      })
      .finally(() => setLoading(false));

    return () => window.speechSynthesis?.cancel();
  }, [topicId]);

  function speak(text?: string) {
    const finalText = text || content?.ttsText;
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

  useEffect(() => {
    if (accessProfile === "AUDITORY" && content && autoNarration && !hasAutoNarrated.current) {
      hasAutoNarrated.current = true;
      const t = setTimeout(() => speak(), 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, accessProfile, autoNarration]);

  if (loading) return <p className="text-gray-400">Adaptando contenido del tema...</p>;
  if (!content) return null;

  return (
    <div className="space-y-4">
      {cacheHit && (
        <p className="flex items-center gap-1 text-xs font-medium text-eco-lightgreen">
          <Sparkles className="h-3.5 w-3.5" /> Contenido reutilizado de la caché (Eco-Prompting): 0
          peticiones de IA adicionales.
        </p>
      )}

      {/* Profile-specific content rendering */}
      {accessProfile === "AUDITORY" && content.ttsText && (
        <AuditoryContent blocks={content.blocks} ttsText={content.ttsText} />
      )}

      {accessProfile === "VISUAL" && (
        <VisualContent blocks={content.blocks} />
      )}

      {accessProfile === "MOTOR" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {content.blocks.map((b, i) => (
            <button
              key={i}
              type="button"
              onClick={() => speak(b)}
              className="flex min-h-[140px] items-center justify-center rounded-2xl bg-eco-green p-5 text-center text-lg font-bold text-white shadow transition hover:bg-eco-lightgreen focus:outline-none focus-visible:ring-4 focus-visible:ring-eco-accent/50"
            >
              {b || `Idea ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {accessProfile === "STANDARD" && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="leading-relaxed text-gray-700">{content.blocks[0]}</p>
        </div>
      )}

      {/* Fallback for other profiles */}
      {!["AUDITORY", "VISUAL", "MOTOR", "STANDARD"].includes(accessProfile) && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="leading-relaxed text-gray-700">{content.blocks[0]}</p>
        </div>
      )}
    </div>
  );
}