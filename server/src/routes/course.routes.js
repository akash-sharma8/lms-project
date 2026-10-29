import { Router } from "express";
import {
  createCourse,
  listCourses,
  myCourses,
  getCourse,
  updateCourse,
  togglePublish,
  deleteCourse,
} from "../controllers/course.controller.js";
import { addLesson } from "../controllers/lesson.controller.js";
import { protect, allowRoles, optionalAuth } from "../middleware/auth.js";

const router = Router();
const teacher = allowRoles("instructor", "admin");

router.get("/", listCourses);
router.get("/mine", protect, teacher, myCourses); // /:id se PEHLE rakhna zaroori hai
router.post("/", protect, teacher, createCourse);

router.get("/:id", optionalAuth, getCourse);
router.put("/:id", protect, teacher, updateCourse);
router.patch("/:id/publish", protect, teacher, togglePublish);
router.delete("/:id", protect, teacher, deleteCourse);

router.post("/:id/lessons", protect, teacher, addLesson);

export default router;