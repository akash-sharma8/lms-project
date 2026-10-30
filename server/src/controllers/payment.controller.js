import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import { getRazorpay, signatureIsValid } from "../services/payment.js";

const feePercent = () => Number(process.env.PLATFORM_FEE_PERCENT) || 20;

export async function createOrder(req, res) {
  const course = await Course.findById(req.params.courseId);
  if (!course || course.status !== "published") {
    return res.status(404).json({ message: "Course not found" });
  }
  if (course.price <= 0) {
    return res.status(400).json({ message: "This course is free, use the enroll button" });
  }

  const already = await Enrollment.exists({ student: req.user._id, course: course._id });
  if (already) return res.status(400).json({ message: "Already enrolled" });

  // amount DB se aata hai, client se nahi, taaki koi price badal na sake
  const order = await getRazorpay().orders.create({
    amount: course.price * 100, // paise me
    currency: "INR",
    receipt: `r_${Date.now()}`, // max 40 chars
    notes: { courseId: course._id.toString(), studentId: req.user._id.toString() },
  });

  const platformFee = Math.round((course.price * feePercent()) / 100);
  await Payment.create({
    student: req.user._id,
    course: course._id,
    instructor: course.instructor,
    amount: course.price,
    platformFee,
    instructorShare: course.price - platformFee,
    orderId: order.id,
  });

  res.status(201).json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    courseTitle: course.title,
  });
}

export async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing payment details" });
  }

  // order isi student ka hona chahiye
  const payment = await Payment.findOne({
    orderId: razorpay_order_id,
    student: req.user._id,
  });
  if (!payment) return res.status(404).json({ message: "Order not found" });

  // dobara verify call aaye to kuch naya mat karo
  if (payment.status === "paid") {
    return res.json({ message: "Payment already verified", courseId: payment.course });
  }

  if (!signatureIsValid(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  payment.status = "paid";
  payment.paymentId = razorpay_payment_id;
  payment.paidAt = new Date();
  await payment.save();

  // upsert: do baar chala to bhi ek hi enrollment banega
  await Enrollment.updateOne(
    { student: payment.student, course: payment.course },
    { $setOnInsert: { student: payment.student, course: payment.course } },
    { upsert: true }
  );

  res.json({ message: "Payment successful, you are enrolled", courseId: payment.course });
}

// last 6 mahine ke labels (khali mahine bhi chart me 0 dikhein)
function lastMonths(n) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    out.push({ key, label: m.toLocaleString("en-IN", { month: "short", year: "2-digit" }) });
  }
  return out;
}

export async function earnings(req, res) {
  const match = { instructor: req.user._id, status: "paid" };

  const [totals] = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        gross: { $sum: "$amount" },
        earned: { $sum: "$instructorShare" },
        fee: { $sum: "$platformFee" },
        sales: { $sum: 1 },
      },
    },
  ]);

  const byCourse = await Payment.aggregate([
    { $match: match },
    { $group: { _id: "$course", sales: { $sum: 1 }, earned: { $sum: "$instructorShare" } } },
    { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { $project: { _id: 1, title: "$course.title", sales: 1, earned: 1 } },
    { $sort: { earned: -1 } },
  ]);

  const months = lastMonths(6);
  const since = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);
  const rows = await Payment.aggregate([
    { $match: { ...match, paidAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$paidAt" } },
        earned: { $sum: "$instructorShare" },
        sales: { $sum: 1 },
      },
    },
  ]);
  const byKey = Object.fromEntries(rows.map((r) => [r._id, r]));
  const monthly = months.map((m) => ({
    month: m.label,
    earned: byKey[m.key]?.earned || 0,
    sales: byKey[m.key]?.sales || 0,
  }));

  const recent = await Payment.find(match)
    .sort({ paidAt: -1 })
    .limit(10)
    .populate("student", "name")
    .populate("course", "title");

  res.json({
    totals: totals || { gross: 0, earned: 0, fee: 0, sales: 0 },
    feePercent: feePercent(),
    byCourse,
    monthly,
    recent: recent.map((p) => ({
      _id: p._id,
      student: p.student?.name,
      course: p.course?.title,
      amount: p.amount,
      earned: p.instructorShare,
      paidAt: p.paidAt,
    })),
  });
}