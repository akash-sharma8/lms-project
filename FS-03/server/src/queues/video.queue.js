import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const videoQueue = new Queue("video", {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,                                   // fail hone par ek baar aur try
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 50,                          // purane jobs Redis mein jama na hon
    removeOnFail: 100,
  },
});