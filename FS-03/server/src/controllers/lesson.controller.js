import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import { videoQueue } from "../queues/video.queue.js";
import Enrollment from "../models/Enrollment.js";

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


// upload se PEHLE ownership check, taaki bina permission wali file disk par na aaye
export async function loadOwnedLesson(req, res, next) {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const course = await Course.findById(lesson.course);
  if (!canManage(course, req.user)) {
    return res.status(403).json({ message: "Not your course" });
  }

  req.lesson = lesson;
  next();
}

export function blockIfProcessing(req, res, next) {
  if (req.lesson.video.status === "processing") {
    return res.status(409).json({ message: "Video is still processing, try again later" });
  }
  next();
}

export async function uploadVideo(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Attach a video file in the 'video' field" });
  }

  const lesson = req.lesson;
  lesson.video.rawKey = req.file.filename;
  lesson.video.hlsKey = undefined;
  lesson.video.status = "uploaded";
  await lesson.save();

  await videoQueue.add("convert", {
    lessonId: lesson._id.toString(),
    rawFile: req.file.filename,
  });

  res.status(202).json({ message: "Upload received, processing started", status: "uploaded" });
}

export function videoStatus(req, res) {
  const { status, duration, hlsKey } = req.lesson.video;
  res.json({ status, duration, hlsKey });
}


export async function completeLesson(req, res) {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: lesson.course,
  });
  if (!enrollment) return res.status(403).json({ message: "You are not enrolled" });

  // $addToSet se dobara complete karne par duplicate entry nahi banti
  await Enrollment.updateOne(
    { _id: enrollment._id },
    { $addToSet: { completedLessons: lesson._id } }
  );

  const fresh = await Enrollment.findById(enrollment._id);
  const course = await Course.findById(lesson.course).select("totalLessons");

  const done = fresh.completedLessons.length;
  fresh.progress = Math.min(100, Math.round((done / course.totalLessons) * 100));
  if (fresh.progress === 100 && !fresh.completedAt) {
    fresh.completedAt = new Date();
  }
  await fresh.save();

  res.json({ progress: fresh.progress, completedLessons: fresh.completedLessons });
}