import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { RAW_DIR, HLS_DIR } from "../config/paths.js";
import { convertToHls } from "../services/ffmpeg.js";
import Lesson from "../models/Lesson.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("Worker: MongoDB connected");

const worker = new Worker(
  "video",
  async (job) => {
    const { lessonId, rawFile } = job.data;
    const input = path.join(RAW_DIR, rawFile);
    const outDir = path.join(HLS_DIR, lessonId);
    const started = Date.now();

    await Lesson.findByIdAndUpdate(lessonId, { "video.status": "processing" });
    console.log(`[${job.id}] converting ${rawFile}`);

    // purana output ho to saaf karo (re-upload case)
    await fs.rm(outDir, { recursive: true, force: true });

    const result = await convertToHls(input, outDir);

    await Lesson.findByIdAndUpdate(lessonId, {
      "video.status": "ready",
      "video.hlsKey": `${lessonId}/master.m3u8`,
      "video.duration": result.duration,
    });

    await fs.rm(input, { force: true }); // raw file ki ab zaroorat nahi

    const secs = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`[${job.id}] done in ${secs}s, renditions: ${result.renditions.join(", ")}p`);
    return { seconds: Number(secs), ...result };
  },
  { connection: redis, concurrency: 1 }
);

worker.on("failed", async (job, err) => {
  console.error(`[${job?.id}] failed (attempt ${job?.attemptsMade}):`, err.message);
  // sirf aakhri attempt ke baad hi "failed" mark karo
  if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
    await Lesson.findByIdAndUpdate(job.data.lessonId, { "video.status": "failed" });
    await fs.rm(path.join(RAW_DIR, job.data.rawFile), { force: true });
  }
});

console.log("Worker: waiting for jobs...");