import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";

// video dekhne ki permission: admin, course ka owner, ya enrolled student
export async function canWatch(req, res, next) {
  const lesson = await Lesson.findById(req.params.id).select("course video.status");
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });
  if (lesson.video.status !== "ready") {
    return res.status(404).json({ message: "Video is not ready" });
  }

  const course = await Course.findById(lesson.course).select("instructor");
  const user = req.user;
  const isOwner = user.role === "admin" || course.instructor.equals(user._id);

  if (!isOwner) {
    const enrolled = await Enrollment.exists({ student: user._id, course: course._id });
    if (!enrolled) {
      return res.status(403).json({ message: "Enroll in this course to watch" });
    }
  }
  next();
}