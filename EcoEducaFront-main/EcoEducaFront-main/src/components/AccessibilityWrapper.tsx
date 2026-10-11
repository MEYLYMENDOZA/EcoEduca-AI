import { ReactNode, useEffect } from "react";
import { useAuthStore, AccessProfile } from "../store/authStore";
import { useAccessibilitySettings } from "../store/accessibilitySettings";

interface Props {
  children: ReactNode;
}

// Profile descriptions for display
export const PROFILE_INFO: Record<AccessProfile, { label: string; description: string; icon: string }> = {
  STANDARD: { label: "Estándar", description: "Experiencia completa con gamificación y animaciones", icon: "🎯" },
  VISUAL: { label: "Visual", description: "Infografías, pictogramas y apoyo visual intensivo", icon: "👁️" },
  AUDITORY: { label: "Auditivo", description: "Narración automática, comandos de voz y alto contraste", icon: "🎧" },
  MOTOR: { label: "Motora", description: "Macro-tarjetas, comandos de voz y SÍ/NO", icon: "🖐️" },
  DYSLEXIA: { label: "Dislexia", description: "Tipografía especial, audio sincronizado y fondo crema", icon: "📖" },
  ADHD: { label: "TDAH", description: "Micro-sesiones, timer y recompensas frecuentes", icon: "⚡" },
  AUTISM: { label: "TEA", description: "Rutina predecible, sin sorpresas, lenguaje concreto", icon: "🧩" },
  ADVANCED: { label: "Avanzado", description: "Modo skip, contenido extra y mayor desafío", icon: "🚀" },
  LANGUAGE: { label: "Idioma", description: "Vocabulario simplificado, traducción y apoyo visual", icon: "🌐" },
  NIGHT: { label: "Nocturno", description: "Modo oscuro, brillo reducido, sin azul", icon: "🌙" },
};

// Apply profile-specific body classes
function applyProfileClasses(profile: AccessProfile, fontScale: number, extraContrast: boolean, darkMode: boolean, openDyslexic: boolean, reduceAnimations: boolean) {
  const body = document.body;

  // Remove all profile classes
  body.classList.remove(
    "profile-standard", "profile-visual", "profile-auditory", "profile-motor",
    "profile-dyslexia", "profile-adhd", "profile-autism", "profile-advanced",
    "profile-language", "profile-night",
    "eco-high-contrast", "eco-dark-mode", "eco-dyslexic-font", "eco-reduced-animations"
  );

  // Add profile class
  body.classList.add(`profile-${profile.toLowerCase()}`);

  // Apply specific styles
  if (profile === "AUDITORY" || extraContrast) {
    body.classList.add("eco-high-contrast");
  }

  if (darkMode || profile === "NIGHT") {
    body.classList.add("eco-dark-mode");
  }

  if (openDyslexic || profile === "DYSLEXIA") {
    body.classList.add("eco-dyslexic-font");
  }

  if (reduceAnimations || profile === "AUTISM" || profile === "MOTOR") {
    body.classList.add("eco-reduced-animations");
  }

  // Base font size
  const baseFontSizes: Record<AccessProfile, number> = {
    STANDARD: 1,
    VISUAL: 1,
    AUDITORY: 1.15,
    MOTOR: 1.25,
    DYSLEXIA: 1.1,
    ADHD: 1,
    AUTISM: 1,
    ADVANCED: 1,
    LANGUAGE: 1.1,
    NIGHT: 1,
  };

  const baseSize = baseFontSizes[profile] || 1;
  document.documentElement.style.fontSize = `${baseSize * fontScale}rem`;
}

export default function AccessibilityWrapper({ children }: Props) {
  const accessProfile = useAuthStore((s) => s.user?.accessProfile) || "STANDARD";
  const { fontScale, extraContrast, darkMode, openDyslexic, reduceAnimations } = useAccessibilitySettings();

  useEffect(() => {
    applyProfileClasses(accessProfile, fontScale, extraContrast, darkMode, openDyslexic, reduceAnimations);
  }, [accessProfile, fontScale, extraContrast, darkMode, openDyslexic, reduceAnimations]);

  return (
    <div
      role="main"
      aria-live="polite"
      data-access-profile={accessProfile}
      className="min-h-screen transition-colors duration-300"
    >
      {children}
    </div>
  );
}