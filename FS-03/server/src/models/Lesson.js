import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    video: {
      rawKey: String,      // where the original upload sits in S3
      hlsKey: String,      // path to the .m3u8 playlist after conversion
      duration: Number,    // seconds
      status: {
        type: String,
        enum: ["none", "uploaded", "processing", "ready", "failed"],
        default: "none",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);