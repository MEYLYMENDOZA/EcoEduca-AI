import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  getOverview,
  listStudents,
  createStudent,
  updateStudent,
  resetStudentPassword,
  listCoursesWithStudents,
  createCourse,
  createTopic,
  createQuiz,
  uploadTopicMaterial,
  enrollStudent,
  unenrollStudent,
  assignGrade,
  getGreenDashboard,
} from "../controllers/teacher.controller";

const router = Router();

// Almacenamiento en memoria: el archivo se procesa (extracción de texto) y se
// descarta, nunca se persiste en disco.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Todas las rutas del panel docente requieren sesión activa con rol TEACHER o ADMIN
router.use(requireAuth, requireRole("TEACHER", "ADMIN"));

router.get("/overview", getOverview);
router.get("/dashboard", getGreenDashboard);

// Gestión de alumnos
router.get("/students", listStudents);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.put("/students/:id/password", resetStudentPassword);

// Gestión de cursos, temas y quizzes
router.get("/courses", listCoursesWithStudents);
router.post("/courses", createCourse);
router.post("/courses/:courseId/topics", createTopic);
router.post("/topics/:topicId/quizzes", createQuiz);
// Carga de material (PDF/Word) por tema/semana: la IA regenera resumen + quizzes.
router.post("/topics/:topicId/material", upload.single("file"), uploadTopicMaterial);

// Matrículas y notas
router.post("/courses/:courseId/enrollment", enrollStudent);
router.delete("/courses/:courseId/enrollment/:userId", unenrollStudent);
router.put("/courses/:courseId/students/:userId/grade", assignGrade);

export default router;
