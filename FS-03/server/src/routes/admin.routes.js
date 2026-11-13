import { Router } from "express";
import {
  stats,
  listUsers,
  changeRole,
  deleteUser,
  listAllCourses,
} from "../controllers/admin.controller.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

// is router ke saare routes sirf admin ke liye
router.use(protect, allowRoles("admin"));

router.get("/stats", stats);
router.get("/users", listUsers);
router.patch("/users/:id/role", changeRole);
router.delete("/users/:id", deleteUser);
router.get("/courses", listAllCourses);

export default router;