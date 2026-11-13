import { Router } from "express";
import { myEnrollments } from "../controllers/enrollment.controller.js";
import { issueCertificate } from "../controllers/certificate.controller.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
router.get("/mine", protect, myEnrollments);
router.post("/:courseId/certificate", protect, allowRoles("student"), issueCertificate);
export default router;