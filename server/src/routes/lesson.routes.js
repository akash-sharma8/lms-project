import { Router } from "express";
import { updateLesson, deleteLesson } from "../controllers/lesson.controller.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
const teacher = allowRoles("instructor", "admin");

router.put("/:id", protect, teacher, updateLesson);
router.delete("/:id", protect, teacher, deleteLesson);

export default router;