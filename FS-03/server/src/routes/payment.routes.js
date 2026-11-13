import { Router } from "express";
import { createOrder, verifyPayment, earnings } from "../controllers/payment.controller.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

router.post("/order/:courseId", protect, allowRoles("student"), createOrder);
router.post("/verify", protect, allowRoles("student"), verifyPayment);
router.get("/earnings", protect, allowRoles("instructor", "admin"), earnings);

export default router;