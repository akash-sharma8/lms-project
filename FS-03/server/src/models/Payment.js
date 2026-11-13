import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },          // rupees
    currency: { type: String, default: "INR" },
    platformFee: { type: Number, default: 0 },         // rupees
    instructorShare: { type: Number, default: 0 },     // rupees
    orderId: { type: String, required: true, unique: true },
    paymentId: String,
    status: { type: String, enum: ["created", "paid"], default: "created" },
    paidAt: Date,
  },
  { timestamps: true }
);

paymentSchema.index({ instructor: 1, status: 1, paidAt: -1 });

export default mongoose.model("Payment", paymentSchema);