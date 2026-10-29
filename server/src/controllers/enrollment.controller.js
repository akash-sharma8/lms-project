import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export async function enroll(req, res) {
  const course = await Course.findById(req.params.id);
  if (!course || course.status !== "published") {
    return res.status(404).json({ message: "Course not found" });
  }

  const already = await Enrollment.findOne({ student: req.user._id, course: course._id });
  if (already) return res.status(400).json({ message: "Already enrolled" });

  // TODO (payment step): paid courses ke liye yahan payment verify hoga
  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
  });
  res.status(201).json(enrollment);
}

export async function myEnrollments(req, res) {
  const list = await Enrollment.find({ student: req.user._id })
    .populate("course", "title thumbnail category totalLessons")
    .sort({ createdAt: -1 });
  res.json(list);
}