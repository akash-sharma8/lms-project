import crypto from "crypto";
import Enrollment from "../models/Enrollment.js";
import Quiz from "../models/Quiz.js";
import Attempt from "../models/Attempt.js";
import { writeCertificate } from "../services/certificate.js";


const clientBase = (process.env.CLIENT_URL || "").split(",")[0].trim();
const makeCertId = () => "CERT-" + crypto.randomBytes(5).toString("hex").toUpperCase();

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

// student course complete kare to certificate ID milti hai (dobara maangne par wahi ID)
export async function issueCertificate(req, res) {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });
  if (!enrollment) return res.status(404).json({ message: "You are not enrolled" });

  if (enrollment.certificateId) {
    return res.json({ certificateId: enrollment.certificateId });
  }

  if (enrollment.progress < 100) {
    return res.status(400).json({
      message: `Finish all lessons first (you are at ${enrollment.progress}%)`,
    });
  }

  // course ke har quiz me kam se kam ek pass attempt hona chahiye
  const quizzes = await Quiz.find({ course: enrollment.course }).select("title");
  for (const quiz of quizzes) {
    const passed = await Attempt.exists({
      student: req.user._id,
      quiz: quiz._id,
      passed: true,
    });
    if (!passed) {
      return res.status(400).json({ message: `Pass the quiz "${quiz.title}" first` });
    }
  }

  enrollment.certificateId = makeCertId();
  if (!enrollment.completedAt) enrollment.completedAt = new Date();
  await enrollment.save();

  res.status(201).json({ certificateId: enrollment.certificateId });
}

export async function downloadCertificate(req, res) {
  const enrollment = await Enrollment.findOne({ certificateId: req.params.certId })
    .populate("student", "name")
    .populate({ path: "course", select: "title instructor", populate: { path: "instructor", select: "name" } });

  if (!enrollment) return res.status(404).json({ message: "Certificate not found" });

  // sirf certificate ka malik ya admin
  const isMine = enrollment.student._id.equals(req.user._id);
  if (!isMine && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not your certificate" });
  }

  await writeCertificate(res, {
    studentName: enrollment.student.name,
    courseTitle: enrollment.course.title,
    instructorName: enrollment.course.instructor.name,
    date: fmtDate(enrollment.completedAt || enrollment.updatedAt),
    certId: enrollment.certificateId,
    verifyUrl: `${clientBase}/verify/${enrollment.certificateId}`,
  });
}

// public: login ki zaroorat nahi, aur email jaisi private cheez nahi bhejte
export async function verifyCertificate(req, res) {
  const enrollment = await Enrollment.findOne({ certificateId: req.params.certId })
    .populate("student", "name")
    .populate({ path: "course", select: "title instructor", populate: { path: "instructor", select: "name" } });

  if (!enrollment) return res.status(404).json({ valid: false, message: "Certificate not found" });

  res.json({
    valid: true,
    certificateId: enrollment.certificateId,
    studentName: enrollment.student.name,
    courseTitle: enrollment.course.title,
    instructorName: enrollment.course.instructor.name,
    issuedOn: fmtDate(enrollment.completedAt || enrollment.updatedAt),
  });
}