import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

await connectDB();

// free hosting par alag worker service nahi milti, to isi process me chala do
if (process.env.RUN_WORKER === "true") {
  await import("./workers/video.worker.js");
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));