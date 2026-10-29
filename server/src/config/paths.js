import path from "path";
import fs from "fs";

// server folder se npm run karoge to ye server/storage banega
const root = path.resolve("storage");

export const RAW_DIR = path.join(root, "raw");
export const HLS_DIR = path.join(root, "hls");

for (const dir of [RAW_DIR, HLS_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}