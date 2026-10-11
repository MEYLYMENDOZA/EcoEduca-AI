import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getMyProfile, getMyStats } from "../controllers/profile.controller";

const router = Router();

// Lectura del propio perfil de accesibilidad EBE (solo lectura: lo configura el docente)
router.get("/me", requireAuth, getMyProfile);

// Estadísticas de gamificación del alumno autenticado (XP, racha, insignias)
router.get("/stats", requireAuth, getMyStats);

export default router;
