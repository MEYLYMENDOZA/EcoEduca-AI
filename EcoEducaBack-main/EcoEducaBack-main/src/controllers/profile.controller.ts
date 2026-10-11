import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

// Perfil de accesibilidad del usuario autenticado (solo lectura).
// El accessProfile lo asigna el DOCENTE por cada alumno (ver teacher.controller.ts).
export async function getMyProfile(req: AuthenticatedRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }
  return res.json({
    id: user.id,
    dni: user.dni,
    fullName: user.fullName,
    role: user.role,
    grade: user.grade,
    accessProfile: user.accessProfile,
  });
}

// ---------------------------------------------------------------------------
// Estadísticas de gamificación del alumno (XP, racha de días, insignias).
// Puntaje: 10 XP por respuesta correcta, 2 XP por intento (participación).
// Racha: días consecutivos (hasta hoy) con al menos una respuesta registrada.
// Insignias: hitos alcanzados en base al historial de QuizResponse.
// ---------------------------------------------------------------------------
const XP_PER_CORRECT = 10;
const XP_PER_ATTEMPT = 2;

const BADGE_DEFS = [
  { id: "primer_paso", label: "Primer Paso", icon: "footprints", description: "Responde tu primer quiz." },
  { id: "veinte_respuestas", label: "Estudiante Dedicado", icon: "book-open-check", description: "Responde 20 quizzes." },
  { id: "racha_3", label: "Racha de 3 días", icon: "flame", description: "Estudia 3 días seguidos." },
  { id: "racha_7", label: "Racha de 7 días", icon: "flame", description: "Estudia 7 días seguidos." },
  { id: "explorador", label: "Explorador de Temas", icon: "compass", description: "Responde quizzes de al menos 3 temas distintos." },
  { id: "perfeccionista", label: "Perfeccionista", icon: "star", description: "Logra 100% de aciertos en un tema (mínimo 3 preguntas)." },
] as const;

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const uniqueDays = Array.from(new Set(dates.map(toDateKey))).sort().reverse();
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  const cursor = new Date(uniqueDays[0]);
  for (let i = 1; i < uniqueDays.length; i++) {
    cursor.setDate(cursor.getDate() - 1);
    if (uniqueDays[i] === toDateKey(cursor)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export async function getMyStats(req: AuthenticatedRequest, res: Response) {
  const responses = await prisma.quizResponse.findMany({
    where: { userId: req.user!.id },
    select: { isCorrect: true, createdAt: true, quiz: { select: { topicId: true } } },
  });

  const totalAnswered = responses.length;
  const totalCorrect = responses.filter((r) => r.isCorrect).length;
  const xp = totalCorrect * XP_PER_CORRECT + (totalAnswered - totalCorrect) * XP_PER_ATTEMPT;
  const streak = computeStreak(responses.map((r) => r.createdAt));
  const distinctTopics = new Set(responses.map((r) => r.quiz.topicId));

  const byTopic = new Map<string, { total: number; correct: number }>();
  for (const r of responses) {
    const entry = byTopic.get(r.quiz.topicId) || { total: 0, correct: 0 };
    entry.total += 1;
    if (r.isCorrect) entry.correct += 1;
    byTopic.set(r.quiz.topicId, entry);
  }
  const hasPerfectTopic = Array.from(byTopic.values()).some((t) => t.total >= 3 && t.correct === t.total);

  const achieved = new Set<string>();
  if (totalAnswered >= 1) achieved.add("primer_paso");
  if (totalAnswered >= 20) achieved.add("veinte_respuestas");
  if (streak >= 3) achieved.add("racha_3");
  if (streak >= 7) achieved.add("racha_7");
  if (distinctTopics.size >= 3) achieved.add("explorador");
  if (hasPerfectTopic) achieved.add("perfeccionista");

  const badges = BADGE_DEFS.map((b) => ({ ...b, achieved: achieved.has(b.id) }));

  return res.json({
    xp,
    streak,
    totalAnswered,
    totalCorrect,
    accuracyPct: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null,
    topicsExplored: distinctTopics.size,
    badges,
  });
}
