import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Volume2 } from "lucide-react";

interface Props {
  front: string;
  back: string;
  onSpeak?: (text: string) => void;
}

export default function Flashcard3D({ front, back, onSpeak }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="perspective-1000 mx-auto h-52 w-full max-w-md cursor-pointer sm:h-60">
      <motion.div
        className="relative h-full w-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-eco-green to-eco-lightgreen p-6 text-white shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-center text-lg font-bold leading-relaxed sm:text-xl">{front}</p>
          <p className="mt-4 text-xs text-white/60">Toca para voltear</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-center text-base leading-relaxed text-gray-700 sm:text-lg">{back}</p>
          <div className="mt-4 flex gap-2">
            {onSpeak && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(back);
                }}
                className="flex items-center gap-1 rounded-full bg-eco-green/10 px-3 py-1.5 text-xs font-semibold text-eco-green transition hover:bg-eco-green/20"
              >
                <Volume2 className="h-3.5 w-3.5" /> Escuchar
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(false);
              }}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-200"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Voltear
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}