import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import coursesRoutes from "./routes/courses.routes";
import topicsRoutes from "./routes/topics.routes";
import quizRoutes from "./routes/quiz.routes";
import teacherRoutes from "./routes/teacher.routes";

dotenv.config();

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "EcoEduca-AI Backend", version: "srs-v2" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/topics", topicsRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/teacher", teacherRoutes);

// Manejo de errores de subida de archivos (multer) en formato JSON consistente.
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Error al subir el archivo: ${err.message}` });
  }
  if (err) {
    return next(err);
  }
  next();
});

export default app;
