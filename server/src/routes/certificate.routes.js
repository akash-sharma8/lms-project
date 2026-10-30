import { Router } from "express";
import { downloadCertificate, verifyCertificate } from "../controllers/certificate.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/:certId/verify", verifyCertificate);          // public
router.get("/:certId/pdf", protect, downloadCertificate);

export default router;