import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";

// owner ya admin hi course badal sakta hai
const canManage = (course, user) =>
  user && (user.role === "admin" || course.instructor.equals(user._id));

export async function createCourse(req, res) {
  const { title, description, category, price, thumbnail } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }
  const course = await Course.create({
    title,
    description,
    category,
    price,
    thumbnail,
    instructor: req.user._id,
  });
  res.status(201).json(course);
}

export async function listCourses(req, res) {
  const { search, category } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 12, 50);

  const filter = { status: "published" };
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  res.json({ courses, total, page, pages: Math.ceil(total / limit) });
}

export async function myCourses(req, res) {
  const courses = await Course.find({ instructor: req.user._id }).sort({ createdAt: -1 });
  res.json(courses);
}

export async function getCourse(req, res) {
  const course = await Course.findById(req.params.id).populate("instructor", "name");
  if (!course) return res.status(404).json({ message: "Course not found" });

  // populate ke baad instructor ek object ban gaya hai, isliye _id se compare
  const isOwner =
    req.user &&
    (req.user.role === "admin" || course.instructor._id.equals(req.user._id));

  if (course.status === "draft" && !isOwner) {
    return res.status(404).json({ message: "Course not found" });
  }

  // baaki logon ko S3 keys nahi dikhani
  const fields = isOwner ? "" : "title order video.status video.duration";
  const lessons = await Lesson.find({ course: course._id }).select(fields).sort("order");

  res.json({ course, lessons });
}

export async function updateCourse(req, res) {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (!canManage(course, req.user)) {
    return res.status(403).json({ message: "Not your course" });
  }

  // sirf ye fields badal sakte hain (instructor/status se chhedkhani nahi)
  for (const key of ["title", "description", "category", "price", "thumbnail"]) {
    if (req.body[key] !== undefined) course[key] = req.body[key];
  }
  await course.save();
  res.json(course);
}

export async function togglePublish(req, res) {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (!canManage(course, req.user)) {
    return res.status(403).json({ message: "Not your course" });
  }

  if (course.status === "draft" && course.totalLessons === 0) {
    return res.status(400).json({ message: "Add at least one lesson before publishing" });
  }

  course.status = course.status === "draft" ? "published" : "draft";
  await course.save();
  res.json(course);
}

export async function deleteCourse(req, res) {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (!canManage(course, req.user)) {
    return res.status(403).json({ message: "Not your course" });
  }

  const enrolled = await Enrollment.countDocuments({ course: course._id });
  if (enrolled > 0) {
    return res
      .status(400)
      .json({ message: "Students are enrolled, unpublish it instead of deleting" });
  }

  await Lesson.deleteMany({ course: course._id });
  await course.deleteOne();
  res.json({ message: "Course deleted" });
}