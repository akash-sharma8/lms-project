import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

await connectDB();
app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);