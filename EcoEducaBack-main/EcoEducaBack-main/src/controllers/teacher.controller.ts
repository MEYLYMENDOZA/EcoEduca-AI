import { Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { extractTextFromDocument, isSupportedDocument } from "../services/documentParser";
import {
  generateTopicContentFromText,
  AiNotConfiguredError,
  AiGenerationError,
} from "../services/aiGenerator";

// ---------------------------------------------------------------------------
// Motor de sugerencia de accessProfile a partir de las discapacidades
// marcadas por el docente al registrar/editar un alumno (HU-02).
// El docente siempre puede sobrescribir manualmente la sugerencia.
// ---------------------------------------------------------------------------
const DISABILITY_VALUES = ["VISUAL", "AUDITIVA", "MOTORA", "INTELECTUAL", "DYSLEXIA", "TDAH", "TEA"] as const;
type Disability = (typeof DISABILITY_VALUES)[number];

export function suggestAccessProfile(disabilities: string[]): string {
  if (disabilities.includes("VISUAL")) return "AUDITORY";
  if (disabilities.includes("AUDITIVA")) return "VISUAL";
  if (disabilities.includes("MOTORA") || disabilities.includes("INTELECTUAL")) return "MOTOR";
  if (disabilities.includes("DYSLEXIA")) return "DYSLEXIA";
  if (disabilities.includes("TDAH")) return "ADHD";
  if (disabilities.includes("TEA")) return "AUTISM";
  return "STANDARD";
}

// Vista general para el Docente/Admin: alumnos agrupados por aula y totales.
export async function getOverview(_req: AuthenticatedRequest, res: Response) {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, fullName: true, grade: true, accessProfile: true },
    orderBy: { grade: "asc" },
  });

  const totalCourses = await prisma.course.count();

  const classrooms = students.reduce<Record<string, typeof students>>((acc, student) => {
    const key = student.grade || "Sin aula asignada";
    acc[key] = acc[key] ? [...acc[key], student] : [student];
    return acc;
  }, {});

  return res.json({
    totalStudents: students.length,
    totalCourses,
    classrooms,
  });
}

const STUDENT_SELECT = {
  id: true,
  fullName: true,
  dni: true,
  grade: true,
  accessProfile: true,
  disabilities: true,
  createdAt: true,
  enrollments: {
    select: { course: { select: { id: true, title: true } } },
  },
  grades: {
    select: { courseId: true, score: true, comment: true },
  },
} as const;

// --- Gestión de alumnos (CRUD) ---

export async function listStudents(_req: AuthenticatedRequest, res: Response) {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: STUDENT_SELECT,
    orderBy: { fullName: "asc" },
  });
  return res.json({ students });
}

const createStudentSchema = z.object({
  fullName: z.string().min(1),
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener exactamente 8 dígitos."),
  password: z.string().min(4),
  grade: z.string().optional(),
  disabilities: z.array(z.enum(DISABILITY_VALUES)).optional(),
  accessProfile: z.enum(["STANDARD", "VISUAL", "AUDITORY", "MOTOR", "DYSLEXIA", "ADHD", "AUTISM", "ADVANCED", "LANGUAGE", "NIGHT"]).optional(),
});

export async function createStudent(req: AuthenticatedRequest, res: Response) {
  const parsed = createStudentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos de alumno inválidos.", detalles: parsed.error.flatten() });
  }
  const { fullName, dni, password, grade, disabilities, accessProfile } = parsed.data;

  const existente = await prisma.user.findUnique({ where: { dni } });
  if (existente) {
    return res.status(409).json({ error: "Ya existe un usuario con ese DNI." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const finalProfile = accessProfile || suggestAccessProfile(disabilities || []);

  const student = await prisma.user.create({
    data: {
      fullName,
      dni,
      password: passwordHash,
      grade,
      disabilities: disabilities?.length ? JSON.stringify(disabilities) : null,
      accessProfile: finalProfile as any,
      role: "STUDENT",
    },
    select: STUDENT_SELECT,
  });

  return res.status(201).json({ student, suggestedAccessProfile: finalProfile });
}

const updateStudentSchema = z.object({
  fullName: z.string().min(1).optional(),
  grade: z.string().optional(),
  disabilities: z.array(z.enum(DISABILITY_VALUES)).optional(),
  accessProfile: z.enum(["STANDARD", "VISUAL", "AUDITORY", "MOTOR", "DYSLEXIA", "ADHD", "AUTISM", "ADVANCED", "LANGUAGE", "NIGHT"]).optional(),
});

export async function updateStudent(req: AuthenticatedRequest, res: Response) {
  const parsed = updateStudentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos.", detalles: parsed.error.flatten() });
  }

  const student = await prisma.user.findFirst({
    where: { id: req.params.id, role: "STUDENT" },
  });
  if (!student) {
    return res.status(404).json({ error: "Alumno no encontrado." });
  }

  const { disabilities, accessProfile, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (disabilities !== undefined) {
    data.disabilities = disabilities.length ? JSON.stringify(disabilities) : null;
    data.accessProfile = accessProfile || suggestAccessProfile(disabilities);
  } else if (accessProfile) {
    data.accessProfile = accessProfile;
  }

  const updated = await prisma.user.update({
    where: { id: student.id },
    data,
    select: STUDENT_SELECT,
  });

  return res.json({ student: updated });
}

const resetPasswordSchema = z.object({
  password: z.string().min(4),
});

export async function resetStudentPassword(req: AuthenticatedRequest, res: Response) {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Contraseña inválida (mínimo 4 caracteres)." });
  }

  const student = await prisma.user.findFirst({
    where: { id: req.params.id, role: "STUDENT" },
  });
  if (!student) {
    return res.status(404).json({ error: "Alumno no encontrado." });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: student.id },
    data: { password: passwordHash },
  });

  return res.json({ ok: true });
}

// --- Gestión de cursos, temas y matrículas ---

export async function listCoursesWithStudents(_req: AuthenticatedRequest, res: Response) {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      grade: true,
      topics: {
        select: {
          id: true,
          title: true,
          order: true,
          weekLabel: true,
          generatedByAI: true,
          sourceFileName: true,
          contentUpdatedAt: true,
          _count: { select: { quizzes: true } },
        },
        orderBy: { order: "asc" },
      },
      enrollments: {
        select: {
          user: { select: { id: true, fullName: true, dni: true, grade: true } },
        },
      },
      grades: {
        select: { userId: true, score: true, comment: true },
      },
    },
    orderBy: { title: "asc" },
  });
  return res.json({ courses });
}

const createCourseSchema = z.object({
  title: z.string().min(1),
  grade: z.string().min(1),
});

export async function createCourse(req: AuthenticatedRequest, res: Response) {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos de curso inválidos." });
  }
  const course = await prisma.course.create({ data: parsed.data });
  return res.status(201).json({ course });
}

const createTopicSchema = z.object({
  title: z.string().min(1),
  summaryText: z.string().min(1),
  order: z.number().int().min(1).optional(),
  weekLabel: z.string().optional(),
});

export async function createTopic(req: AuthenticatedRequest, res: Response) {
  const parsed = createTopicSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos de tema inválidos." });
  }
  const { courseId } = req.params;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ error: "Curso no encontrado." });

  const topic = await prisma.topic.create({ data: { ...parsed.data, courseId } });
  return res.status(201).json({ topic });
}

const createQuizSchema = z.object({
  question: z.string().min(1),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().optional(),
  correctOpt: z.enum(["A", "B", "C"]),
  explanation: z.string().optional(),
});

export async function createQuiz(req: AuthenticatedRequest, res: Response) {
  const parsed = createQuizSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos de quiz inválidos." });
  }
  const { topicId } = req.params;
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) return res.status(404).json({ error: "Tema no encontrado." });

  const quiz = await prisma.quiz.create({ data: { ...parsed.data, topicId } });
  return res.status(201).json({ quiz });
}

// --- Carga de material docente (PDF/Word) ---
const MAX_MATERIAL_SIZE_BYTES = 10 * 1024 * 1024;

export async function uploadTopicMaterial(req: AuthenticatedRequest, res: Response) {
  const { topicId } = req.params;
  const file = (req as any).file as Express.Multer.File | undefined;

  if (!file) {
    return res.status(400).json({ error: "Debes adjuntar un archivo PDF o Word (.docx)." });
  }
  if (file.size > MAX_MATERIAL_SIZE_BYTES) {
    return res.status(400).json({ error: "El archivo supera el límite de 10 MB." });
  }
  if (!isSupportedDocument(file.mimetype, file.originalname)) {
    return res.status(400).json({ error: "Formato no soportado. Sube un PDF o un Word (.docx)." });
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return res.status(404).json({ error: "Tema no encontrado." });
  }

  let rawText: string;
  try {
    rawText = await extractTextFromDocument(file.buffer, file.mimetype, file.originalname);
  } catch (err) {
    return res.status(400).json({ error: (err as Error).message });
  }

  if (!rawText || rawText.trim().length < 50) {
    return res.status(400).json({
      error: "No se pudo extraer suficiente texto legible del archivo. Verifica que no sea un PDF escaneado (imagen).",
    });
  }

  let generated;
  try {
    generated = await generateTopicContentFromText(rawText, topic.title);
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return res.status(503).json({ error: err.message });
    }
    if (err instanceof AiGenerationError) {
      return res.status(502).json({ error: err.message });
    }
    return res.status(502).json({ error: "La IA no pudo generar el contenido. Intenta de nuevo." });
  }

  await prisma.$transaction(async (tx) => {
    await tx.topic.update({
      where: { id: topicId },
      data: {
        summaryText: generated.summary,
        sourceFileName: file.originalname,
        contentUpdatedAt: new Date(),
        generatedByAI: true,
      },
    });
    await tx.aICache.deleteMany({ where: { topicId } });
    await tx.quiz.deleteMany({ where: { topicId } });
    for (const q of generated.quizzes) {
      await tx.quiz.create({
        data: {
          topicId,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          correctOpt: q.correctOpt,
          explanation: q.explanation,
        },
      });
    }
  });

  return res.json({
    message: `Se generaron ${generated.quizzes.length} preguntas nuevas con IA a partir de "${file.originalname}".`,
    quizCount: generated.quizzes.length,
    summaryPreview: generated.summary.slice(0, 240),
  });
}

const matriculaSchema = z.object({
  userId: z.string().min(1),
});

export async function enrollStudent(req: AuthenticatedRequest, res: Response) {
  const parsed = matriculaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "userId es requerido." });
  }
  const { courseId } = req.params;
  const { userId } = parsed.data;

  const [curso, student] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.user.findFirst({ where: { id: userId, role: "STUDENT" } }),
  ]);
  if (!curso) return res.status(404).json({ error: "Curso no encontrado." });
  if (!student) return res.status(404).json({ error: "Alumno no encontrado." });

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });

  return res.status(201).json({ enrollment });
}

export async function unenrollStudent(req: AuthenticatedRequest, res: Response) {
  const { courseId, userId } = req.params;
  await prisma.enrollment.deleteMany({ where: { userId, courseId } });
  return res.json({ ok: true });
}

// --- Gestión de notas ---

const gradeSchema = z.object({
  score: z.number().min(0).max(20),
  comment: z.string().optional(),
});

export async function assignGrade(req: AuthenticatedRequest, res: Response) {
  const parsed = gradeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "La nota debe ser un valor entre 0 y 20." });
  }
  const { courseId, userId } = req.params;
  const { score, comment } = parsed.data;

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrolled) {
    return res.status(400).json({ error: "El alumno no está matriculado en este curso." });
  }

  const grade = await prisma.grade.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, score, comment },
    update: { score, comment },
  });

  return res.json({ grade });
}

// --- Dashboard docente ---

const CO2_GRAMS_PER_AI_CALL = 4.3;
const SHEETS_PER_AI_CALL = 1;
const RISK_SCORE_THRESHOLD = 60;
const RISK_INACTIVITY_DAYS = 7;

export async function getGreenDashboard(_req: AuthenticatedRequest, res: Response) {
  const [students, aiCacheEntries] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        fullName: true,
        dni: true,
        accessProfile: true,
        responses: { select: { isCorrect: true, createdAt: true } },
      },
    }),
    prisma.aICache.findMany({ select: { hitsCount: true } }),
  ]);

  const now = Date.now();
  const studentProgress = students.map((s) => {
    const total = s.responses.length;
    const correct = s.responses.filter((r) => r.isCorrect).length;
    const avgQuizScore = total > 0 ? Math.round((correct / total) * 100) : null;
    const lastActivity = total > 0
      ? new Date(Math.max(...s.responses.map((r) => r.createdAt.getTime())))
      : null;
    const daysSinceLastActivity = lastActivity
      ? Math.floor((now - lastActivity.getTime()) / 86400000)
      : null;
    const atRisk =
      total === 0 ||
      (avgQuizScore !== null && avgQuizScore < RISK_SCORE_THRESHOLD) ||
      (daysSinceLastActivity !== null && daysSinceLastActivity > RISK_INACTIVITY_DAYS);

    return {
      id: s.id,
      dni: s.dni,
      fullName: s.fullName,
      accessProfile: s.accessProfile,
      topicsAnswered: total,
      avgQuizScore,
      lastActivity,
      daysSinceLastActivity,
      atRisk,
    };
  });

  const aiRequestsSaved = aiCacheEntries.reduce((sum, e) => sum + e.hitsCount, 0);

  return res.json({
    studentProgress,
    atRiskStudents: studentProgress.filter((s) => s.atRisk),
    greenMetrics: {
      aiRequestsSaved,
      estimatedSheetsSaved: aiRequestsSaved * SHEETS_PER_AI_CALL,
      co2ReductionGrams: Math.round(aiRequestsSaved * CO2_GRAMS_PER_AI_CALL * 100) / 100,
    },
  });
}