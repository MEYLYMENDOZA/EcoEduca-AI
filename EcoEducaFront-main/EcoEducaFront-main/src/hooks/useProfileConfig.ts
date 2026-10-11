import { useMemo } from "react";
import { AccessProfile, useAuthStore } from "../store/authStore";
import { useAccessibilitySettings } from "../store/accessibilitySettings";

export interface ProfileConfig {
  /** Base font size multiplier */
  baseFontSize: number;
  /** Whether to show voice narration controls */
  showAudioControls: boolean;
  /** Whether to auto-narrate content */
  autoNarrate: boolean;
  /** Whether to show pictograms/visual supports */
  showPictograms: boolean;
  /** Whether to use simplified content (macro-cards, less text) */
  simplifiedContent: boolean;
  /** Whether to show animations and confetti */
  showAnimations: boolean;
  /** Whether to enable voice commands for answering */
  enableVoiceCommands: boolean;
  /** Whether to show timer */
  showTimer: boolean;
  /** Whether to use dark mode */
  darkMode: boolean;
  /** Whether to use OpenDyslexic font */
  useOpenDyslexic: boolean;
  /** Whether to show extra contrast */
  highContrast: boolean;
  /** Layout style */
  layout: "standard" | "visual-grid" | "audio-list" | "motor-simple";
  /** Quiz style */
  quizStyle: "standard" | "visual-cards" | "voice-buttons" | "yes-no";
  /** Practice mode preference */
  practiceMode: "all" | "flashcards-only" | "match-only";
  /** Content display style */
  contentDisplay: "paragraph" | "infographic" | "audio-narrative" | "macro-cards";
  /** Color theme */
  colorTheme: "default" | "dark" | "cream" | "high-contrast";
  /** Card style for topics */
  cardStyle: "default" | "minimal" | "large";
  /** XP feedback frequency */
  xpFeedback: "normal" | "frequent" | "minimal";
}

export function useProfileConfig(): ProfileConfig {
  const accessProfile = useAuthStore((s) => s.user?.accessProfile) || "STANDARD";
  const settings = useAccessibilitySettings();

  return useMemo((): ProfileConfig => {
    // Base config per profile
    const baseConfigs: Record<AccessProfile, ProfileConfig> = {
      STANDARD: {
        baseFontSize: 1,
        showAudioControls: false,
        autoNarrate: false,
        showPictograms: false,
        simplifiedContent: false,
        showAnimations: true,
        enableVoiceCommands: false,
        showTimer: false,
        darkMode: false,
        useOpenDyslexic: false,
        highContrast: false,
        layout: "standard",
        quizStyle: "standard",
        practiceMode: "all",
        contentDisplay: "paragraph",
        colorTheme: "default",
        cardStyle: "default",
        xpFeedback: "normal",
      },
      VISUAL: {
        baseFontSize: 1,
        showAudioControls: false,
        autoNarrate: false,
        showPictograms: true,
        simplifiedContent: false,
        showAnimations: true,
        enableVoiceCommands: false,
        showTimer: false,
        darkMode: false,
        useOpenDyslexic: false,
        highContrast: false,
        layout: "visual-grid",
        quizStyle: "visual-cards",
        practiceMode: "match-only",
        contentDisplay: "infographic",
        colorTheme: "default",
        cardStyle: "default",
        xpFeedback: "normal",
      },
      AUDITORY: {
        baseFontSize: 1.15,
        showAudioControls: true,
        autoNarrate: true,
        showPictograms: false,
        simplifiedContent: false,
        showAnimations: false,
        enableVoiceCommands: true,
        showTimer: false,
        darkMode: false,
        useOpenDyslexic: false,
        highContrast: true,
        layout: "audio-list",
        quizStyle: "voice-buttons",
        practiceMode: "flashcards-only",
        contentDisplay: "audio-narrative",
        colorTheme: "high-contrast",
        cardStyle: "large",
        xpFeedback: "minimal",
      },
      MOTOR: {
        baseFontSize: 1.25,
        showAudioControls: true,
        autoNarrate: false,
        showPictograms: false,
        simplifiedContent: true,
        showAnimations: false,
        enableVoiceCommands: true,
        showTimer: false,
        darkMode: false,
        useOpenDyslexic: false,
        highContrast: false,
        layout: "motor-simple",
        quizStyle: "yes-no",
        practiceMode: "flashcards-only",
        contentDisplay: "macro-cards",
        colorTheme: "default",
        cardStyle: "large",
        xpFeedback: "minimal",
      },
      DYSLEXIA: {
        baseFontSize: 1.1,
        showAudioControls: true,
        autoNarrate: true,
        showPictograms: true,
        simplifiedContent: false,
        showAnimations: true,
        enableVoiceCommands: false,
        showTimer: false,
        darkMode: false,
        useOpenDyslexic: true,
        highContrast: false,
        layout: "standard",
        quizStyle: "standard",
        practiceMode: "all",
        contentDisplay: "paragraph",
        colorTheme: "cream",
        cardStyle: "default",
        xpFeedback: "normal",
      },
      ADHD: {
        baseFontSize: 1,
        showAudioControls: false,
        autoNarrate: false,
        showPictograms: false,
        simplifiedContent: true,
        showAnimations: false,
        enableVoiceCommands: false,
        showTimer: true,
        darkMode: false,
        useOpenDyslexic: false,
        highContrast: false,
        layout: "motor-simple",
        quizStyle: "standard",
        practiceMode: "flashcards-only",
        contentDisplay: "macro-cards",
        colorTheme: "default",
        cardStyle: "minimal",
        xpFeedback: "frequent",
      },
      AUTISM: {
        baseFontSize: 1,
        showAudioControls: false,
        autoNarrate: false,
        showPictograms: true,
        simplifiedContent: true,
        showAnimations: false,
        enableVoiceCommands: false,
        showTimer: false,
        darkMode: false,
        useOpenDyslexic: false,
        highContrast: false,
        layout: "motor-simple",
        quizStyle: "standard",
        practiceMode: "flashcards-only",
        contentDisplay: "macro-cards",
        colorTheme: "default",
        cardStyle: "minimal",
        xpFeedback: "minimal",
      },
      ADVANCED: {
        baseFontSize: 1,
        showAudioControls: false,
        autoNarrate: false,
        showPictograms: false,
        simplifiedContent: false,
        showAnimations: true,
        enableVoiceCommands: false,
        showTimer: false,
        darkMode: false,
        useOpenDyslexic: false,
        highContrast: false,
        layout: "standard",
        quizStyle: "standard",
        practiceMode: "all",
        contentDisplay: "paragraph",
        colorTheme: "default",
        cardStyle: "default",
        xpFeedback: "normal",
      },
      LANGUAGE: {
        baseFontSize: 1.1,
        showAudioControls: true,
        autoNarrate: true,
        showPictograms: true,
        simplifiedContent: false,
        showAnimations: true,
        enableVoiceCommands: false,
        showTimer: false,
        darkMode: false,
        useOpenDyslexic: false,
        highContrast: false,
        layout: "standard",
        quizStyle: "standard",
        practiceMode: "all",
        contentDisplay: "paragraph",
        colorTheme: "default",
        cardStyle: "default",
        xpFeedback: "normal",
      },
      NIGHT: {
        baseFontSize: 1,
        showAudioControls: false,
        autoNarrate: false,
        showPictograms: false,
        simplifiedContent: false,
        showAnimations: false,
        enableVoiceCommands: false,
        showTimer: false,
        darkMode: true,
        useOpenDyslexic: false,
        highContrast: false,
        layout: "standard",
        quizStyle: "standard",
        practiceMode: "all",
        contentDisplay: "paragraph",
        colorTheme: "dark",
        cardStyle: "default",
        xpFeedback: "minimal",
      },
    };

    // Get base config for the profile
    const base = baseConfigs[accessProfile] || baseConfigs.STANDARD;

    // Apply user overrides from settings
    return {
      ...base,
      baseFontSize: base.baseFontSize * settings.fontScale,
      autoNarrate: settings.autoNarration ? base.autoNarrate : false,
      enableVoiceCommands: settings.voiceCommands || base.enableVoiceCommands,
      simplifiedContent: settings.simplifiedMode || base.simplifiedContent,
      showAnimations: settings.reduceAnimations ? false : base.showAnimations,
      useOpenDyslexic: settings.openDyslexic || base.useOpenDyslexic,
      darkMode: settings.darkMode || base.darkMode,
      highContrast: settings.extraContrast || base.highContrast,
      showTimer: settings.showTimer || base.showTimer,
    };
  }, [accessProfile, settings]);
}