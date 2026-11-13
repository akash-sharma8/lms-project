import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    progress: { type: Number, default: 0 }, // percent
    completedAt: Date,
    certificateId: String,
  },
  { timestamps: true }
);

// one student can only enroll once per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ certificateId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Enrollment", enrollmentSchema);