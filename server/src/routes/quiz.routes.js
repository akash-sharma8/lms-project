import { Router } from "express";
import {
  getQuiz,
  submitQuiz,
  myAttempts,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quiz.controller.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
const teacher = allowRoles("instructor", "admin");

router.get("/:id", protect, getQuiz);
router.post("/:id/submit", protect, allowRoles("student"), submitQuiz);
router.get("/:id/attempts", protect, myAttempts);
router.put("/:id", protect, teacher, updateQuiz);
router.delete("/:id", protect, teacher, deleteQuiz);

export default router;