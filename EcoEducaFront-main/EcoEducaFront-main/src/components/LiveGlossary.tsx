import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X } from "lucide-react";

interface GlossaryEntry {
  word: string;
  meaning: string;
  pictogram?: string;
}

interface Props {
  entries: GlossaryEntry[];
  text: string;
}

export default function LiveGlossary({ entries, text }: Props) {
  const [activeWord, setActiveWord] = useState<GlossaryEntry | null>(null);

  // Highlight words in text that have glossary entries
  const highlightText = (content: string) => {
    if (entries.length === 0) return content;

    let result = content;
    entries.forEach((entry) => {
      const regex = new RegExp(`\\b(${entry.word})\\b`, "gi");
      result = result.replace(
        regex,
        `|||GLOSSARY_START|||$1|||GLOSSARY_END|||`
      );
    });

    const parts = result.split(/\|\|\|GLOSSARY_START\|\|\||\|\|\|GLOSSARY_END\|\|\|/);
    const elements: React.ReactNode[] = [];
    let isGlossary = false;

    parts.forEach((part, i) => {
      if (isGlossary) {
        const entry = entries.find(
          (e) => e.word.toLowerCase() === part.toLowerCase()
        );
        if (entry) {
          elements.push(
            <button
              key={i}
              onClick={() => setActiveWord(entry)}
              className="relative inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1 font-semibold text-amber-800 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-accent/50"
              title="Ver definición"
            >
              {part}
              <BookOpen className="inline h-3 w-3" />
            </button>
          );
        } else {
          elements.push(<span key={i}>{part}</span>);
        }
      } else {
        elements.push(<span key={i}>{part}</span>);
      }
      isGlossary = !isGlossary;
    });

    return elements;
  };

  return (
    <>
      <div className="leading-relaxed text-gray-700">{highlightText(text)}</div>

      <AnimatePresence>
        {activeWord && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute z-40 w-72"
            style={{
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-xl">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-amber-800">{activeWord.word}</h4>
                <button
                  onClick={() => setActiveWord(null)}
                  className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-600">{activeWord.meaning}</p>
              {activeWord.pictogram && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 p-2">
                  <span className="text-2xl">{activeWord.pictogram}</span>
                  <span className="text-xs text-gray-500">Pictograma de apoyo</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}