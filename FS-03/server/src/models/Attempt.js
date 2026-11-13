import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    answers: [Number],   // -1 matlab student ne answer nahi diya
    score: Number,       // kitne sahi
    total: Number,
    percent: Number,
    passed: Boolean,
  },
  { timestamps: true }
);

attemptSchema.index({ student: 1, quiz: 1 });

export default mongoose.model("Attempt", attemptSchema);