import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Attempt from "../models/Attempt.js";
import Payment from "../models/Payment.js";

export async function stats(req, res) {
  const [users, courses, published, enrollments, money] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Course.countDocuments({ status: "published" }),
    Enrollment.countDocuments(),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, gross: { $sum: "$amount" }, fee: { $sum: "$platformFee" } } },
    ]),
  ]);
  res.json({
    users,
    courses,
    published,
    enrollments,
    gross: money[0]?.gross || 0,
    platformFee: money[0]?.fee || 0,
  });
}

export async function listUsers(req, res) {
  const { search, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    // user ka text regex me jaane se pehle special characters escape karo
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: safe, $options: "i" } },
      { email: { $regex: safe, $options: "i" } },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(users);
}

export async function changeRole(req, res) {
  const { role } = req.body;
  if (!["student", "instructor"].includes(role)) {
    return res.status(400).json({ message: "Role must be student or instructor" });
  }
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: "User not found" });
  if (target.role === "admin") {
    return res.status(400).json({ message: "Admin accounts cannot be changed here" });
  }
  target.role = role;
  await target.save();
  res.json(target);
}

export async function deleteUser(req, res) {
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: "User not found" });
  if (target._id.equals(req.user._id)) {
    return res.status(400).json({ message: "You cannot delete yourself" });
  }
  if (target.role === "admin") {
    return res.status(400).json({ message: "Admin accounts cannot be deleted here" });
  }

  const owned = await Course.countDocuments({ instructor: target._id });
  if (owned > 0) {
    return res
      .status(400)
      .json({ message: `This instructor owns ${owned} course(s). Remove or unpublish them first` });
  }

  // payment records financial history hain, unhe rehne do
  await Enrollment.deleteMany({ student: target._id });
  await Attempt.deleteMany({ student: target._id });
  await target.deleteOne();
  res.json({ message: "User deleted" });
}

export async function listAllCourses(req, res) {
  const courses = await Course.find()
    .populate("instructor", "name email")
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(courses);
}