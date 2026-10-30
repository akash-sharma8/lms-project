import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  options: {
    type: [String],
    validate: (v) => v.length >= 2 && v.length <= 6,
  },
  correctIndex: { type: Number, required: true, min: 0 },
  explanation: String,
});

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    passPercent: { type: Number, default: 60, min: 1, max: 100 },
    questions: [questionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);