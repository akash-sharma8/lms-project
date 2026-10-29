import IORedis from "ioredis";

// BullMQ ko maxRetriesPerRequest: null chahiye, warna worker error deta hai
export const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on("error", (err) => console.error("Redis error:", err.message));