import { Router } from "express";
import { login } from "../controllers/auth.controller";

const router = Router();

// Autenticación universal por DNI + contraseña (STUDENT/TEACHER/ADMIN)
router.post("/login", login);

export default router;
