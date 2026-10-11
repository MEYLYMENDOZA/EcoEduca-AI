import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, CheckCircle2, Star, Sparkles } from "lucide-react";

interface VisualBlock {
  icon: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

interface Props {
  blocks: string[];
  topicTitle: string;
}

const BLOCK_ICONS = ["🌍", "📚", "💡", "⭐", "🔬", "🎨", "🏛️", "🌿", "🌊", "🔥", "⚡", "🎯"];
const BLOCK_COLORS = [
  { color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50" },
  { color: "from-emerald-500 to-emerald-600", bgColor: "bg-emerald-50" },
  { color: "from-amber-500 to-amber-600", bgColor: "bg-amber-50" },
  { color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50" },
  { color: "from-rose-500 to-rose-600", bgColor: "bg-rose-50" },
  { color: "from-cyan-500 to-cyan-600", bgColor: "bg-cyan-50" },
];

function createVisualBlocks(blocks: string[], topicTitle: string): VisualBlock[] {
  return blocks.slice(0, 6).map((block, i) => {
    const sentences = block.split(/(?<=[.!?])\s+/);
    const title = sentences[0]?.slice(0, 50) || "Idea principal";
    const description = sentences.slice(1).join(" ").slice(0, 80) || block.slice(0, 80);
    const colorSet = BLOCK_COLORS[i % BLOCK_COLORS.length];
    return {
      icon: BLOCK_ICONS[i % BLOCK_ICONS.length],
      title,
      description,
      color: colorSet.color,
      bgColor: colorSet.bgColor,
    };
  });
}

export default function VisualExperience({ blocks, topicTitle }: Props) {
  const visualBlocks = createVisualBlocks(blocks, topicTitle);
  const [viewedBlocks, setViewedBlocks] = useState<Set<number>>(new Set());

  const handleBlockView = (index: number) => {
    setViewedBlocks((prev) => new Set(prev).add(index));
  };

  const allViewed = viewedBlocks.size >= visualBlocks.length;

  return (
    <div className="space-y-6">
      {/* Visual Header - Zero text approach */}
      <div className="flex items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
        <Eye className="h-10 w-10" />
        <div className="text-center">
          <p className="text-2xl font-bold">{topicTitle}</p>
          <p className="text-blue-200">Modo Visual - Sin texto, solo iconos</p>
        </div>
        <Sparkles className="h-10 w-10" />
      </div>

      {/* Progress indicator - visual only */}
      <div className="flex items-center justify-center gap-2">
        {visualBlocks.map((_, i) => (
          <motion.div
            key={i}
            className={`h-3 rounded-full transition-all ${
              viewedBlocks.has(i) ? "w-8 bg-green-500" : "w-3 bg-gray-300"
            }`}
            animate={{ scale: viewedBlocks.has(i) ? 1.2 : 1 }}
          />
        ))}
      </div>

      {/* Infographic Grid - large cards, minimal text */}
      <div className="grid gap-4 sm:grid-cols-2">
        {visualBlocks.map((block, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.03, y: -5 }}
            onViewportEnter={() => handleBlockView(i)}
            className="group cursor-pointer overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:shadow-2xl"
          >
            {/* Color bar */}
            <div className={`h-3 bg-gradient-to-r ${block.color}`} />

            <div className="p-6">
              {/* Large icon */}
              <div className="mb-4 flex justify-center">
                <motion.div
                  animate={viewedBlocks.has(i) ? { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 text-4xl shadow-inner"
                >
                  {block.icon}
                </motion.div>
              </div>

              {/* Title - minimal text */}
              <h4 className="text-center text-lg font-bold text-gray-800">{block.title}</h4>

              {/* Description - very short */}
              <p className="mt-2 text-center text-sm leading-relaxed text-gray-600">
                {block.description}
              </p>

              {/* Visual feedback */}
              <div className="mt-4 flex justify-center">
                <AnimatePresence>
                  {viewedBlocks.has(i) && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-bold text-green-700">Visto</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visual summary - icon based */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border-4 border-dashed border-blue-300 bg-blue-50 p-6"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="flex -space-x-2">
            {visualBlocks.slice(0, 4).map((block, i) => (
              <div
                key={i}
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${block.color} text-xl shadow-lg ring-4 ring-white`}
              >
                {block.icon}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="font-bold text-blue-800">{visualBlocks.length} ideas visuales</p>
            <p className="text-sm text-blue-600">
              {viewedBlocks.size}/{visualBlocks.length} vistas
            </p>
          </div>
          {allViewed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 rounded-full bg-green-500 px-4 py-2 text-white"
            >
              <Star className="h-5 w-5 fill-current" />
              <span className="font-bold">¡Todo visto!</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Color legend - visual only */}
      <div className="flex items-center justify-center gap-4 rounded-xl bg-gray-50 p-4">
        {BLOCK_COLORS.slice(0, 4).map((colorSet, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`h-4 w-4 rounded-full bg-gradient-to-br ${colorSet.color}`} />
            <span className="text-xs text-gray-500">
              {i === 0 ? "Personas" : i === 1 ? "Naturaleza" : i === 2 ? "Números" : "Ideas"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
