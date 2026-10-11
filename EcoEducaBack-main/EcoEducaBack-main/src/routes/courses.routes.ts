import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Listado de cursos: el STUDENT solo ve los cursos en los que está matriculado.
// El TEACHER/ADMIN ve todos los cursos (para fines de gestión).
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (req.user!.role === "STUDENT") {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user!.id },
      select: {
        course: { select: { id: true, title: true, grade: true } },
      },
    });
    return res.json({ courses: enrollments.map((e) => e.course) });
  }

  const courses = await prisma.course.findMany({
    select: { id: true, title: true, grade: true },
  });
  res.json({ courses });
});

// Detalle de curso + temas semanales, con progreso del alumno y recomendación
// de "tema actual" (el primer tema con quizzes pendientes; si todos están
// completos, se recomienda el último). Sin contenido adaptado por IA (ver
// /api/topics/:id/adapt).
router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (req.user!.role === "STUDENT") {
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user!.id, courseId: req.params.id } },
    });
    if (!enrolled) {
      return res.status(403).json({ error: "No estás matriculado en este curso." });
    }
  }

  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      title: true,
      grade: true,
      topics: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          weekLabel: true,
          quizzes: { select: { id: true } },
        },
      },
    },
  });

  if (!course) {
    return res.status(404).json({ error: "Curso no encontrado." });
  }

  let answeredByTopic: Record<string, number> = {};
  if (req.user!.role === "STUDENT") {
    const topicIds = course.topics.map((t) => t.id);
    const responses = await prisma.quizResponse.findMany({
      where: { userId: req.user!.id, quiz: { topicId: { in: topicIds } } },
      select: { quiz: { select: { topicId: true } } },
    });
    answeredByTopic = responses.reduce<Record<string, number>>((acc, r) => {
      acc[r.quiz.topicId] = (acc[r.quiz.topicId] || 0) + 1;
      return acc;
    }, {});
  }

  const topics = course.topics.map((t) => {
    const totalQuizzes = t.quizzes.length;
    const answered = answeredByTopic[t.id] || 0;
    return {
      id: t.id,
      title: t.title,
      order: t.order,
      weekLabel: t.weekLabel,
      totalQuizzes,
      answeredQuizzes: Math.min(answered, totalQuizzes),
      completed: totalQuizzes > 0 && answered >= totalQuizzes,
    };
  });

  const firstIncomplete = topics.find((t) => !t.completed);
  const recommendedTopicId = req.user!.role === "STUDENT"
    ? (firstIncomplete?.id ?? topics[topics.length - 1]?.id ?? null)
    : null;

  res.json({ course: { id: course.id, title: course.title, grade: course.grade, topics, recommendedTopicId } });
});

export default router;
