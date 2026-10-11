import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { adaptTopic, ProfileType } from "../services/aiAdapter";
import { extractFlashcards, extractMatchPairs, extractTimeline, extractKeywords } from "../services/contentExtractor";

// Detalle de un tema: metadatos + quizzes
export async function getTopic(req: AuthenticatedRequest, res: Response) {
  const topic = await prisma.topic.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      title: true,
      courseId: true,
      order: true,
      weekLabel: true,
      quizzes: {
        select: { id: true, question: true, optionA: true, optionB: true, optionC: true },
      },
    },
  });

  if (!topic) {
    return res.status(404).json({ error: "Tema no encontrado." });
  }

  if (req.user!.role === "STUDENT") {
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user!.id, courseId: topic.courseId } },
    });
    if (!enrolled) {
      return res.status(403).json({ error: "No estás matriculado en este curso." });
    }
  }

  return res.json({ topic });
}

// Contenido del tema adaptado por el Motor de Eco-Prompting según el
// accessProfile del alumno autenticado.
export async function getAdaptedTopic(req: AuthenticatedRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  const overrideProfile = req.query.profile as string | undefined;
  const allowed = ["STANDARD", "VISUAL", "AUDITORY", "MOTOR", "DYSLEXIA", "ADHD", "AUTISM", "ADVANCED", "LANGUAGE", "NIGHT"];
  const profileType: ProfileType =
    overrideProfile && allowed.includes(overrideProfile) && req.user!.role !== "STUDENT"
      ? (overrideProfile as ProfileType)
      : (user.accessProfile as ProfileType);

  try {
    const { content, cacheHit, hitsCount } = await adaptTopic(req.params.id, profileType);
    return res.json({ content, profileType, cacheHit, hitsCount });
  } catch {
    return res.status(404).json({ error: "Tema no encontrado." });
  }
}

// ---------------------------------------------------------------------------
// GET /topics/:id/flashcards - Flashcards con contenido real del tema
// ---------------------------------------------------------------------------
export async function getTopicFlashcards(req: AuthenticatedRequest, res: Response) {
  const topic = await prisma.topic.findUnique({ where: { id: req.params.id } });
  if (!topic) return res.status(404).json({ error: "Tema no encontrado." });

  const flashcards = extractFlashcards(topic.summaryText, topic.title);
  return res.json({ flashcards });
}

// ---------------------------------------------------------------------------
// GET /topics/:id/match-pairs - Pares término↔definición del tema
// ---------------------------------------------------------------------------
export async function getTopicMatchPairs(req: AuthenticatedRequest, res: Response) {
  const topic = await prisma.topic.findUnique({ where: { id: req.params.id } });
  if (!topic) return res.status(404).json({ error: "Tema no encontrado." });

  const pairs = extractMatchPairs(topic.summaryText, topic.title);
  return res.json({ pairs });
}

// ---------------------------------------------------------------------------
// GET /topics/:id/timeline - Eventos ordenables del tema
// ---------------------------------------------------------------------------
export async function getTopicTimeline(req: AuthenticatedRequest, res: Response) {
  const topic = await prisma.topic.findUnique({ where: { id: req.params.id } });
  if (!topic) return res.status(404).json({ error: "Tema no encontrado." });

  const timeline = extractTimeline(topic.summaryText, topic.title);
  return res.json({ timeline });
}

// ---------------------------------------------------------------------------
// GET /topics/:id/keywords - Palabras clave con peso del tema
// ---------------------------------------------------------------------------
export async function getTopicKeywords(req: AuthenticatedRequest, res: Response) {
  const topic = await prisma.topic.findUnique({ where: { id: req.params.id } });
  if (!topic) return res.status(404).json({ error: "Tema no encontrado." });

  const keywords = extractKeywords(topic.summaryText, topic.title);
  return res.json({ keywords });
}
