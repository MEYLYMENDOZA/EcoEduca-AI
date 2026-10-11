import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Generación de contenido curricular con IA real (Google Gemini API).
//
// NOTA DE DISEÑO: se eligió Gemini (modelo "gemini-1.5-flash") porque Google AI
// Studio ofrece una capa gratuita (free tier) con cuota diaria generosa, sin
// tarjeta de crédito: https://aistudio.google.com/apikey
//
// Este servicio SÍ llama a un LLM real (a diferencia de aiAdapter.ts, que es el
// adaptador local determinista usado para la vista "por perfil de accesibilidad").
// Se usa específicamente cuando el docente sube material (PDF/Word) para un
// tema/semana: el texto extraído se envía a Gemini para generar:
//   1. Un resumen (nuevo `Topic.summaryText`, insumo del motor de Eco-Prompting).
//   2. Un set de preguntas de opción múltiple con explicación (`Quiz[]`).
//
// Si `GEMINI_API_KEY` no está configurada, se lanza `AiNotConfiguredError` para
// que el controlador devuelva un 503 claro en vez de fallar de forma confusa.
// ---------------------------------------------------------------------------

const MODEL_NAME = "gemini-1.5-flash";
const MAX_SOURCE_CHARS = 12000; // limita tokens de entrada (costo/latencia)

export class AiNotConfiguredError extends Error {}
export class AiGenerationError extends Error {}

export interface GeneratedQuiz {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  correctOpt: "A" | "B" | "C";
  explanation: string;
}

export interface GeneratedTopicContent {
  summary: string;
  quizzes: GeneratedQuiz[];
}

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiNotConfiguredError(
      "La generación con IA no está configurada. Obtén una clave gratuita en " +
        "https://aistudio.google.com/apikey y agrégala como GEMINI_API_KEY en el backend."
    );
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
}

function extractJsonBlock(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

function validateGenerated(parsed: any): GeneratedTopicContent {
  if (!parsed || typeof parsed.summary !== "string" || !Array.isArray(parsed.quizzes)) {
    throw new AiGenerationError("La IA devolvió un formato inesperado.");
  }

  const quizzes: GeneratedQuiz[] = parsed.quizzes
    .filter(
      (q: any) =>
        q &&
        typeof q.question === "string" &&
        typeof q.optionA === "string" &&
        typeof q.optionB === "string" &&
        typeof q.optionC === "string" &&
        ["A", "B", "C"].includes(q.correctOpt)
    )
    .map((q: any) => ({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      correctOpt: q.correctOpt,
      explanation: typeof q.explanation === "string" ? q.explanation : "",
    }));

  if (quizzes.length === 0) {
    throw new AiGenerationError("La IA no generó ninguna pregunta válida.");
  }

  return { summary: parsed.summary, quizzes };
}

// Genera resumen + preguntas a partir del texto extraído de un PDF/Word subido
// por el docente para un tema/semana específico.
export async function generateTopicContentFromText(
  rawText: string,
  topicTitle: string,
  quizCount = 6
): Promise<GeneratedTopicContent> {
  const model = getModel();
  const truncated = rawText.slice(0, MAX_SOURCE_CHARS);

  const prompt = `Eres un asistente pedagógico para 5to grado de primaria (Perú).
A partir del siguiente material fuente sobre el tema "${topicTitle}", genera:

1. Un resumen claro, ameno y correcto (200-400 palabras), basado ESTRICTAMENTE en el
   material proporcionado (no inventes datos que no estén en el texto).
2. Exactamente ${quizCount} preguntas de opción múltiple (3 opciones: A, B y C), de
   dificultad variada, cada una con una breve explicación pedagógica de por qué la
   respuesta correcta lo es.

Responde EXCLUSIVAMENTE con un JSON válido (sin markdown, sin texto adicional antes o
después), con esta forma exacta:
{"summary": "...", "quizzes": [{"question": "...", "optionA": "...", "optionB": "...", "optionC": "...", "correctOpt": "A", "explanation": "..."}]}

Material fuente:
"""
${truncated}
"""`;

  let text: string;
  try {
    const result = await model.generateContent(prompt);
    text = result.response.text();
  } catch (err) {
    throw new AiGenerationError(
      `No se pudo contactar al servicio de IA: ${(err as Error).message}`
    );
  }

  let parsed: any;
  try {
    parsed = JSON.parse(extractJsonBlock(text));
  } catch {
    throw new AiGenerationError("La IA devolvió una respuesta que no se pudo interpretar como JSON.");
  }

  return validateGenerated(parsed);
}
