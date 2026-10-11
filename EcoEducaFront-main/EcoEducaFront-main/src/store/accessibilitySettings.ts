import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AccessibilitySettingsState {
  fontScale: number;
  voiceRate: number;
  autoNarration: boolean;
  extraContrast: boolean;
  voiceCommands: boolean;
  simplifiedMode: boolean;
  autoAdvance: boolean;
  reduceAnimations: boolean;
  openDyslexic: boolean;
  darkMode: boolean;
  showTimer: boolean;
  timerMinutes: number;
  setFontScale: (v: number) => void;
  setVoiceRate: (v: number) => void;
  setAutoNarration: (v: boolean) => void;
  setExtraContrast: (v: boolean) => void;
  setVoiceCommands: (v: boolean) => void;
  setSimplifiedMode: (v: boolean) => void;
  setAutoAdvance: (v: boolean) => void;
  setReduceAnimations: (v: boolean) => void;
  setOpenDyslexic: (v: boolean) => void;
  setDarkMode: (v: boolean) => void;
  setShowTimer: (v: boolean) => void;
  setTimerMinutes: (v: number) => void;
}

export const useAccessibilitySettings = create<AccessibilitySettingsState>()(
  persist(
    (set) => ({
      fontScale: 1,
      voiceRate: 1,
      autoNarration: true,
      extraContrast: false,
      voiceCommands: false,
      simplifiedMode: false,
      autoAdvance: false,
      reduceAnimations: false,
      openDyslexic: false,
      darkMode: false,
      showTimer: false,
      timerMinutes: 5,
      setFontScale: (v) => set({ fontScale: v }),
      setVoiceRate: (v) => set({ voiceRate: v }),
      setAutoNarration: (v) => set({ autoNarration: v }),
      setExtraContrast: (v) => set({ extraContrast: v }),
      setVoiceCommands: (v) => set({ voiceCommands: v }),
      setSimplifiedMode: (v) => set({ simplifiedMode: v }),
      setAutoAdvance: (v) => set({ autoAdvance: v }),
      setReduceAnimations: (v) => set({ reduceAnimations: v }),
      setOpenDyslexic: (v) => set({ openDyslexic: v }),
      setDarkMode: (v) => set({ darkMode: v }),
      setShowTimer: (v) => set({ showTimer: v }),
      setTimerMinutes: (v) => set({ timerMinutes: v }),
    }),
    { name: "ecoeduca-accessibility-settings" }
  )
);