import multer from "multer";
import path from "path";
import crypto from "crypto";
import { RAW_DIR } from "../config/paths.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, RAW_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

const allowed = [".mp4", ".mov", ".mkv", ".webm", ".avi"];

export const uploadVideoFile = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Only mp4, mov, mkv, webm or avi videos are allowed"));
    }
    cb(null, true);
  },
});