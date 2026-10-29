import { Router } from "express";
import { myEnrollments } from "../controllers/enrollment.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.get("/mine", protect, myEnrollments);
export default router;