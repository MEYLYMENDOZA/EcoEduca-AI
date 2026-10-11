import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { respondQuiz } from "../controllers/quiz.controller";

const router = Router();

router.post("/:id/respond", requireAuth, respondQuiz);

export default router;
