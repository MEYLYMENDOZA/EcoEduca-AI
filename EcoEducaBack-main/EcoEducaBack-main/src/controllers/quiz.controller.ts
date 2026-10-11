import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

// Registra la respuesta de un alumno a un Quiz, incluyendo el `modeUsed`
// (perfil de accesibilidad activo al responder, HU-04).
const respondSchema = z.object({
  selectedOpt: z.enum(["A", "B", "C"]),
});

export async function respondQuiz(req: AuthenticatedRequest, res: Response) {
  const parsed = respondSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Respuesta inválida (debe ser A, B o C)." });
  }

  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz) {
    return res.status(404).json({ error: "Quiz no encontrado." });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  const { selectedOpt } = parsed.data;
  const isCorrect = selectedOpt === quiz.correctOpt;

  const response = await prisma.quizResponse.upsert({
    where: { userId_quizId: { userId: user.id, quizId: quiz.id } },
    create: {
      userId: user.id,
      quizId: quiz.id,
      selectedOpt,
      isCorrect,
      modeUsed: user.accessProfile,
    },
    update: {
      selectedOpt,
      isCorrect,
      modeUsed: user.accessProfile,
    },
  });

  return res.json({
    isCorrect,
    correctOpt: quiz.correctOpt,
    explanation: quiz.explanation,
    response,
  });
}
