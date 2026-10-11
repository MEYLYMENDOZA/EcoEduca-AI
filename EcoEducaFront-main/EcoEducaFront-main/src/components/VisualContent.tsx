import { motion } from "framer-motion";
import { Lightbulb, Image, BookOpen, Star, CheckCircle2 } from "lucide-react";

interface VisualBlock {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Props {
  blocks: string[];
}

// Convert text blocks into visual infographic cards
function createVisualBlocks(blocks: string[]): VisualBlock[] {
  const icons = ["🌍", "📚", "💡", "⭐", "🔬", "🎨", "🏛️", "🌿"];
  const colors = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-amber-500 to-amber-600",
    "from-purple-500 to-purple-600",
    "from-rose-500 to-rose-600",
    "from-cyan-500 to-cyan-600",
    "from-orange-500 to-orange-600",
    "from-teal-500 to-teal-600",
  ];

  return blocks.map((block, i) => {
    // Extract first sentence as title
    const sentences = block.split(/(?<=[.!?])\s+/);
    const title = sentences[0]?.slice(0, 60) || "Idea principal";
    const description = sentences.slice(1).join(" ").slice(0, 120) || block.slice(0, 120);

    return {
      icon: icons[i % icons.length],
      title,
      description,
      color: colors[i % colors.length],
    };
  });
}

export default function VisualContent({ blocks }: Props) {
  const visualBlocks = createVisualBlocks(blocks);

  return (
    <div className="space-y-4">
      {/* Visual header */}
      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <span className="text-2xl">👁️</span>
        <div>
          <p className="font-bold text-blue-800">Modo Visual</p>
          <p className="text-sm text-blue-600">
            Contenido organizado con pictogramas y apoyo visual
          </p>
        </div>
      </div>

      {/* Infographic grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {visualBlocks.map((block, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
          >
            {/* Color bar */}
            <div className={`h-2 bg-gradient-to-r ${block.color}`} />

            <div className="p-5">
              {/* Icon */}
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 text-2xl shadow-inner">
                {block.icon}
              </div>

              {/* Title */}
              <h4 className="font-bold text-gray-800">{block.title}</h4>

              {/* Description */}
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {block.description}
              </p>

              {/* Visual tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {block.title.split(" ").slice(0, 3).map((word, j) => (
                  <span
                    key={j}
                    className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600"
                  >
                    #{word.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visual summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-800">Resumen visual</p>
            <p className="mt-1 text-sm text-blue-600">
              {blocks.length} ideas principales representadas con iconos y colores
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}