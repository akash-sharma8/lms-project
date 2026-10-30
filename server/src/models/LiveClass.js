import mongoose from "mongoose";

const liveClassSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: ["scheduled", "live", "ended"], default: "scheduled" },
    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("LiveClass", liveClassSchema);