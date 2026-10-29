import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";

const canManage = (course, user) =>
  user.role === "admin" || course.instructor.equals(user._id);

// lesson add/delete ke baad course ka count sahi rakhna
async function syncLessonCount(courseId) {
  const count = await Lesson.countDocuments({ course: courseId });
  await Course.findByIdAndUpdate(courseId, { totalLessons: count });
}

export async function addLesson(req, res) {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (!canManage(course, req.user)) {
    return res.status(403).json({ message: "Not your course" });
  }

  const { title, order } = req.body;
  if (!title) return res.status(400).json({ message: "Lesson title is required" });

  const count = await Lesson.countDocuments({ course: course._id });
  const lesson = await Lesson.create({
    course: course._id,
    title,
    order: order ?? count + 1,
  });

  await syncLessonCount(course._id);
  res.status(201).json(lesson);
}

export async function updateLesson(req, res) {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const course = await Course.findById(lesson.course);
  if (!canManage(course, req.user)) {
    return res.status(403).json({ message: "Not your course" });
  }

  if (req.body.title !== undefined) lesson.title = req.body.title;
  if (req.body.order !== undefined) lesson.order = req.body.order;
  await lesson.save();
  res.json(lesson);
}

export async function deleteLesson(req, res) {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const course = await Course.findById(lesson.course);
  if (!canManage(course, req.user)) {
    return res.status(403).json({ message: "Not your course" });
  }

  await lesson.deleteOne();
  await syncLessonCount(course._id);
  res.json({ message: "Lesson deleted" });
}