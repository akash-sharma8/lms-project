import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import Attempt from "../models/Attempt.js";
import Enrollment from "../models/Enrollment.js";

// ek jagah se pata chale: ye user is course ka owner hai, ya enrolled student
async function getAccess(courseId, user) {
  const course = await Course.findById(courseId).select("instructor");
  if (!course) return null;
  const isOwner = user.role === "admin" || course.instructor.equals(user._id);
  const enrolled = isOwner
    ? true
    : !!(await Enrollment.exists({ student: user._id, course: courseId }));
  return { isOwner, enrolled };
}

// questions ki basic jaanch, return karta hai error message ya null
function checkQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return "Add at least one question";
  }
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const n = i + 1;
    if (!q.text || !q.text.trim()) return `Question ${n} has no text`;
    if (!Array.isArray(q.options) || q.options.length < 2) {
      return `Question ${n} needs at least 2 options`;
    }
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      return `Question ${n} has an invalid correct answer`;
    }
  }
  return null;
}

export async function createQuiz(req, res) {
  const access = await getAccess(req.params.id, req.user);
  if (!access) return res.status(404).json({ message: "Course not found" });
  if (!access.isOwner) return res.status(403).json({ message: "Not your course" });

  const { title, passPercent, questions } = req.body;
  if (!title) return res.status(400).json({ message: "Quiz title is required" });
  const problem = checkQuestions(questions);
  if (problem) return res.status(400).json({ message: problem });

  const quiz = await Quiz.create({
    course: req.params.id,
    title,
    passPercent,
    questions,
  });
  res.status(201).json(quiz);
}

export async function updateQuiz(req, res) {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  const access = await getAccess(quiz.course, req.user);
  if (!access.isOwner) return res.status(403).json({ message: "Not your course" });

  const { title, passPercent, questions } = req.body;
  if (questions !== undefined) {
    const problem = checkQuestions(questions);
    if (problem) return res.status(400).json({ message: problem });
    quiz.questions = questions;
  }
  if (title !== undefined) quiz.title = title;
  if (passPercent !== undefined) quiz.passPercent = passPercent;
  await quiz.save();
  res.json(quiz);
}

export async function deleteQuiz(req, res) {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  const access = await getAccess(quiz.course, req.user);
  if (!access.isOwner) return res.status(403).json({ message: "Not your course" });

  await Attempt.deleteMany({ quiz: quiz._id });
  await quiz.deleteOne();
  res.json({ message: "Quiz deleted" });
}

export async function listCourseQuizzes(req, res) {
  const access = await getAccess(req.params.id, req.user);
  if (!access) return res.status(404).json({ message: "Course not found" });
  if (!access.enrolled) return res.status(403).json({ message: "Enroll to see quizzes" });

  const quizzes = await Quiz.find({ course: req.params.id }).sort("createdAt");
  const list = quizzes.map((q) => ({
    _id: q._id,
    title: q.title,
    passPercent: q.passPercent,
    questionCount: q.questions.length,
  }));

  // student ke liye uska best result bhi bhej do
  if (!access.isOwner) {
    const best = await Attempt.aggregate([
      { $match: { student: req.user._id, course: quizzes[0]?.course } },
      { $group: { _id: "$quiz", bestPercent: { $max: "$percent" }, passed: { $max: "$passed" } } },
    ]);
    const byQuiz = Object.fromEntries(best.map((b) => [b._id.toString(), b]));
    for (const item of list) {
      const b = byQuiz[item._id.toString()];
      item.bestPercent = b ? b.bestPercent : null;
      item.passed = b ? b.passed : false;
    }
  }
  res.json(list);
}

export async function getQuiz(req, res) {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  const access = await getAccess(quiz.course, req.user);
  if (!access.enrolled) return res.status(403).json({ message: "Enroll to take this quiz" });

  // owner ko poora quiz, student ko bina sahi answers ke
  if (access.isOwner) return res.json(quiz);

  res.json({
    _id: quiz._id,
    title: quiz.title,
    passPercent: quiz.passPercent,
    questions: quiz.questions.map((q) => ({
      _id: q._id,
      text: q.text,
      options: q.options,
    })),
  });
}

export async function submitQuiz(req, res) {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  // owner khud attempt nahi karega, warna uske attempts stats mein ghus jayenge
  const enrolled = await Enrollment.exists({ student: req.user._id, course: quiz.course });
  if (!enrolled) return res.status(403).json({ message: "Enroll to take this quiz" });

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    return res.status(400).json({ message: "Send one answer per question" });
  }

  let score = 0;
  const review = quiz.questions.map((q, i) => {
    const picked = Number.isInteger(answers[i]) ? answers[i] : -1;
    const correct = picked === q.correctIndex;
    if (correct) score++;
    return {
      question: q.text,
      picked,
      correctIndex: q.correctIndex,
      correct,
      explanation: q.explanation || "",
    };
  });

  const total = quiz.questions.length;
  const percent = Math.round((score / total) * 100);
  const passed = percent >= quiz.passPercent;

  await Attempt.create({
    student: req.user._id,
    quiz: quiz._id,
    course: quiz.course,
    answers: review.map((r) => r.picked),
    score,
    total,
    percent,
    passed,
  });

  res.json({ score, total, percent, passed, passPercent: quiz.passPercent, review });
}

export async function myAttempts(req, res) {
  const attempts = await Attempt.find({ student: req.user._id, quiz: req.params.id })
    .select("score total percent passed createdAt")
    .sort({ createdAt: -1 });
  res.json(attempts);
}