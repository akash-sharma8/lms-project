import { Router } from "express";
import {
  startLive,
  endLive,
  deleteLive,
  joinToken,
} from "../controllers/live.controller.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
const teacher = allowRoles("instructor", "admin");

router.post("/:id/start", protect, teacher, startLive);
router.post("/:id/end", protect, teacher, endLive);
router.post("/:id/token", protect, joinToken);
router.delete("/:id", protect, teacher, deleteLive);

export default router;