import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: "General" },
    price: { type: Number, default: 0 },
    thumbnail: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    totalLessons: { type: Number, default: 0 },
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", description: "text" });

export default mongoose.model("Course", courseSchema);