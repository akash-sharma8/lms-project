import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import lessonRoutes from "./routes/lesson.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import liveRoutes from "./routes/live.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
// local HLS files serve karne ke liye. Step 4 mein CloudFront isko replace karega

app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/live", liveRoutes);
app.use("/api/certificates", certificateRoutes);

app.use((err, req, res, next) => {
      if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }
  if (err.message && err.message.startsWith("Only mp4")) {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: "Duplicate value" });
  }
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

export default app;