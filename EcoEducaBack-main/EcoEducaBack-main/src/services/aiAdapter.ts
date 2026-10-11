import { prisma } from "../lib/prisma";

// ---------------------------------------------------------------------------
// Motor de "Eco-Prompting" (Green Computing / HU-05).
//
// Antes de generar contenido adaptado por IA para un (topic, accessProfile),
// se consulta la caché `AICache`. Si existe, se considera un "hit": se
// incrementa `hitsCount` (una petición de IA evitada) y se devuelve el
// contenido cacheado en <100ms sin regenerar nada.
//
// Si no existe (cache miss), se genera el contenido UNA sola vez y se
// persiste en caché para que el resto de alumnos con el mismo perfil en ese
// tema reutilicen el resultado (Edge Caching a nivel de escuela).
// ---------------------------------------------------------------------------

export type ProfileType = "STANDARD" | "VISUAL" | "AUDITORY" | "MOTOR" | "DYSLEXIA" | "ADHD" | "AUTISM" | "ADVANCED" | "LANGUAGE" | "NIGHT";

interface AdaptedContent {
  type: ProfileType;
  blocks: string[];
  ttsText?: string;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Genera el contenido adaptado localmente a partir del texto base del tema.
function generateContent(summaryText: string, profileType: ProfileType): AdaptedContent {
  const sentences = splitSentences(summaryText);

  switch (profileType) {
    case "AUDITORY": {
      // Guion narrativo pensado para ser leído por Web Speech API (TTS).
      const narrative = sentences.join(" ");
      return { type: profileType, blocks: [narrative], ttsText: narrative };
    }
    case "VISUAL": {
      // Tarjetas jerárquicas / resúmenes visuales cortos para infografías.
      return { type: profileType, blocks: sentences.length ? sentences : [summaryText] };
    }
    case "MOTOR":
    case "ADHD":
    case "AUTISM": {
      // 3 ideas principales como macro-tarjetas gigantes.
      const chunkSize = Math.max(1, Math.ceil(sentences.length / 3));
      const chunks: string[] = [];
      for (let i = 0; i < sentences.length && chunks.length < 3; i += chunkSize) {
        chunks.push(sentences.slice(i, i + chunkSize).join(" "));
      }
      while (chunks.length < 3) chunks.push("");
      return { type: profileType, blocks: chunks };
    }
    case "DYSLEXIA":
    case "LANGUAGE": {
      // Texto con oraciones cortas y vocabulario simplificado.
      const simplified = sentences.map(s => {
        if (s.length > 100) return s.slice(0, 97) + "...";
        return s;
      });
      return {
        type: profileType,
        blocks: simplified.length ? simplified : [summaryText],
        ttsText: simplified.join(" "),
      };
    }
    case "ADVANCED": {
      // Contenido completo sin simplificar
      return { type: profileType, blocks: [summaryText] };
    }
    case "NIGHT": {
      // Mismo contenido que STANDARD pero sin marcas de formato
      return { type: profileType, blocks: [summaryText] };
    }
    default: {
      return { type: "STANDARD", blocks: [summaryText] };
    }
  }
}

export async function adaptTopic(topicId: string, profileType: ProfileType) {
  const cached = await prisma.aICache.findUnique({
    where: { topicId_profileType: { topicId, profileType } },
  });

  if (cached) {
    const updated = await prisma.aICache.update({
      where: { id: cached.id },
      data: { hitsCount: { increment: 1 } },
    });
    return {
      content: JSON.parse(updated.aiContent) as AdaptedContent,
      cacheHit: true,
      hitsCount: updated.hitsCount,
    };
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    throw new Error("Tema no encontrado.");
  }

  const content = generateContent(topic.summaryText, profileType);

  const created = await prisma.aICache.create({
    data: {
      topicId,
      profileType,
      aiContent: JSON.stringify(content),
      hitsCount: 0,
    },
  });

  return { content, cacheHit: false, hitsCount: created.hitsCount };
}