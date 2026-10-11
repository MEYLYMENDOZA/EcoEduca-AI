import { useState, useEffect, useCallback, useRef } from "react";

interface VoiceCommandOptions {
  enabled: boolean;
  lang?: string;
  continuous?: boolean;
  onResult?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  commands?: Record<string, () => void>;
}

interface VoiceCommandState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
}

export function useVoiceCommands(options: VoiceCommandOptions): VoiceCommandState & {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
} {
  const [state, setState] = useState<VoiceCommandState>({
    isListening: false,
    isSupported: false,
    transcript: "",
    confidence: 0,
  });

  const recognitionRef = useRef<any>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Check if browser supports Web Speech API recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setState((prev) => ({ ...prev, isSupported: !!SpeechRecognition }));
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition || !optionsRef.current.enabled) return;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = optionsRef.current.lang || "es-PE";
    recognition.continuous = optionsRef.current.continuous ?? false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase().trim();
      const confidence = event.results[last][0].confidence;

      setState({
        isListening: true,
        isSupported: true,
        transcript,
        confidence,
      });

      optionsRef.current.onResult?.(transcript, confidence);

      // Check for commands
      if (optionsRef.current.commands && event.results[last].isFinal) {
        for (const [phrase, action] of Object.entries(optionsRef.current.commands)) {
          if (transcript.includes(phrase.toLowerCase())) {
            action();
            break;
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      optionsRef.current.onError?.(event.error);
      if (event.error === "not-allowed") {
        setState((prev) => ({ ...prev, isListening: false }));
      }
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }));
    };

    recognition.start();
    recognitionRef.current = recognition;
    setState((prev) => ({ ...prev, isListening: true }));
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
  };
}