import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import apiClient from "../api/client";

interface ConceptNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

interface ConceptConnection {
  from: string;
  to: string;
}

interface Props {
  topicId: string;
  onComplete?: (correct: number, total: number) => void;
}

const NODE_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  "bg-purple-500", "bg-rose-500", "bg-cyan-500",
];

function generateNodes(keywords: { word: string; weight: number }[]): ConceptNode[] {
  return keywords.slice(0, 6).map((kw, i) => ({
    id: `n${i}`,
    label: kw.word,
    x: 50 + Math.cos((i / 6) * Math.PI * 2) * 30,
    y: 50 + Math.sin((i / 6) * Math.PI * 2) * 30,
    color: NODE_COLORS[i % NODE_COLORS.length],
  }));
}

function generateCorrectConnections(nodes: ConceptNode[]): ConceptConnection[] {
  // Create a simple chain: n0→n1, n1→n2, n2→n3, n3→n4, n4→n5
  const connections: ConceptConnection[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    connections.push({ from: nodes[i].id, to: nodes[i + 1].id });
  }
  return connections;
}

export default function ConceptMap({ topicId, onComplete }: Props) {
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [correctConnections, setCorrectConnections] = useState<ConceptConnection[]>([]);
  const [userConnections, setUserConnections] = useState<ConceptConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/topics/${topicId}/keywords`)
      .then(({ data }) => {
        const kws = data.keywords as { word: string; weight: number }[];
        const generatedNodes = generateNodes(kws);
        setNodes(generatedNodes);
        setCorrectConnections(generateCorrectConnections(generatedNodes));
      })
      .catch(() => {
        const fallback = generateNodes([
          { word: "concepto1", weight: 5 }, { word: "concepto2", weight: 5 },
          { word: "concepto3", weight: 5 }, { word: "concepto4", weight: 5 },
          { word: "concepto5", weight: 5 }, { word: "concepto6", weight: 5 },
        ]);
        setNodes(fallback);
        setCorrectConnections(generateCorrectConnections(fallback));
      })
      .finally(() => setLoading(false));
  }, [topicId]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (selectedNode === null) {
        setSelectedNode(nodeId);
        return;
      }
      if (selectedNode === nodeId) {
        setSelectedNode(null);
        return;
      }
      // Create connection
      const newConnection: ConceptConnection = { from: selectedNode, to: nodeId };
      // Check if connection already exists (either direction)
      const exists = userConnections.some(
        (c) =>
          (c.from === newConnection.from && c.to === newConnection.to) ||
          (c.from === newConnection.to && c.to === newConnection.from)
      );
      if (!exists) {
        setUserConnections((prev) => [...prev, newConnection]);
      }
      setSelectedNode(null);
    },
    [selectedNode, userConnections]
  );

  const checkConnections = useCallback(() => {
    let correct = 0;
    for (const uc of userConnections) {
      const isCorrect = correctConnections.some(
        (cc) =>
          (cc.from === uc.from && cc.to === uc.to) ||
          (cc.from === uc.to && cc.to === uc.from)
      );
      if (isCorrect) correct++;
    }
    setCorrectCount(correct);
    setShowResult(true);
    setTimeout(() => onComplete?.(correct, correctConnections.length), 1000);
  }, [userConnections, correctConnections, onComplete]);

  const reset = () => {
    setUserConnections([]);
    setSelectedNode(null);
    setShowResult(false);
    setCorrectCount(0);
  };

  const isConnectionCorrect = (conn: ConceptConnection): boolean => {
    return correctConnections.some(
      (cc) =>
        (cc.from === conn.from && cc.to === conn.to) ||
        (cc.from === conn.to && cc.to === conn.from)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Network className="h-8 w-8 text-eco-accent" />
        </motion.div>
        <span className="ml-3 text-gray-400">Generando mapa conceptual...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <Network className="mr-1 inline h-4 w-4" />
          Conecta los conceptos relacionados haciendo clic en ellos
        </p>
        <div className="flex items-center gap-2">
          {showResult && (
            <span className="text-sm font-semibold text-green-600">
              {correctCount}/{correctConnections.length} correctas
            </span>
          )}
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:border-gray-300"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reiniciar
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100 p-4">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="w-full"
          style={{ minHeight: "300px" }}
        >
          {/* User connections */}
          {userConnections.map((conn, i) => {
            const fromNode = nodes.find((n) => n.id === conn.from);
            const toNode = nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;
            const correct = showResult && isConnectionCorrect(conn);
            const wrong = showResult && !isConnectionCorrect(conn);
            return (
              <line
                key={`${conn.from}-${conn.to}-${i}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={correct ? "#22c55e" : wrong ? "#ef4444" : "#94a3b8"}
                strokeWidth={correct || wrong ? 2 : 1}
                strokeDasharray={wrong ? "4 2" : undefined}
                className="transition-all"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={6}
                className={`${node.color} cursor-pointer transition-all ${
                  selectedNode === node.id ? "ring-4 ring-yellow-400 ring-offset-2" : ""
                }`}
                onClick={() => handleNodeClick(node.id)}
              />
              <text
                x={node.x}
                y={node.y + 12}
                textAnchor="middle"
                className="pointer-events-none select-none text-[4px] font-bold fill-gray-700"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={checkConnections}
          disabled={userConnections.length === 0 || showResult}
          className="rounded-xl bg-gradient-to-r from-eco-green to-eco-lightgreen px-8 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
        >
          Verificar conexiones
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
              correctCount === correctConnections.length
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {correctCount === correctConnections.length ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">¡Todas las conexiones son correctas! 🎉</span>
              </>
            ) : (
              <>
                <span className="font-semibold">
                  {correctCount} de {correctConnections.length} conexiones correctas. Las líneas verdes son correctas, las rojas son incorrectas.
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <p className="text-center text-xs text-gray-400">
        Haz clic en un concepto y luego en otro para conectarlos. Intenta formar una cadena lógica.
      </p>
    </div>
  );
}
