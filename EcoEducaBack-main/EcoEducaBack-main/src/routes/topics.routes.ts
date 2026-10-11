import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getTopic,
  getAdaptedTopic,
  getTopicFlashcards,
  getTopicMatchPairs,
  getTopicTimeline,
  getTopicKeywords,
} from "../controllers/topics.controller";

const router = Router();

router.get("/:id", requireAuth, getTopic);
router.get("/:id/adapt", requireAuth, getAdaptedTopic);
router.get("/:id/flashcards", requireAuth, getTopicFlashcards);
router.get("/:id/match-pairs", requireAuth, getTopicMatchPairs);
router.get("/:id/timeline", requireAuth, getTopicTimeline);
router.get("/:id/keywords", requireAuth, getTopicKeywords);

export default router;
