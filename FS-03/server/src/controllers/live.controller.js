import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import Course from "../models/Course.js";
import LiveClass from "../models/LiveClass.js";
import Enrollment from "../models/Enrollment.js";

const roomName = (live) => `live-${live._id}`;

async function getAccess(courseId, user) {
  const course = await Course.findById(courseId).select("instructor");
  if (!course) return null;
  const isOwner = user.role === "admin" || course.instructor.equals(user._id);
  const enrolled =
    isOwner || !!(await Enrollment.exists({ student: user._id, course: courseId }));
  return { isOwner, enrolled };
}

export async function createLive(req, res) {
  const access = await getAccess(req.params.id, req.user);
  if (!access) return res.status(404).json({ message: "Course not found" });
  if (!access.isOwner) return res.status(403).json({ message: "Not your course" });

  const { title, scheduledAt } = req.body;
  if (!title || !scheduledAt) {
    return res.status(400).json({ message: "Title and date are required" });
  }
  if (isNaN(new Date(scheduledAt).getTime())) {
    return res.status(400).json({ message: "Invalid date" });
  }

  const live = await LiveClass.create({
    course: req.params.id,
    host: req.user._id,
    title,
    scheduledAt,
  });
  res.status(201).json(live);
}

export async function listLive(req, res) {
  const access = await getAccess(req.params.id, req.user);
  if (!access) return res.status(404).json({ message: "Course not found" });
  if (!access.enrolled) return res.status(403).json({ message: "Enroll to see live classes" });

  const list = await LiveClass.find({ course: req.params.id }).sort({ scheduledAt: -1 });
  res.json(list);
}

// owner check ke saath live class load karne wala helper
async function loadForOwner(req, res) {
  const live = await LiveClass.findById(req.params.id);
  if (!live) {
    res.status(404).json({ message: "Live class not found" });
    return null;
  }
  const access = await getAccess(live.course, req.user);
  if (!access.isOwner) {
    res.status(403).json({ message: "Not your course" });
    return null;
  }
  return live;
}

export async function startLive(req, res) {
  const live = await loadForOwner(req, res);
  if (!live) return;
  if (live.status !== "scheduled") {
    return res.status(400).json({ message: `Class is already ${live.status}` });
  }
  live.status = "live";
  live.startedAt = new Date();
  await live.save();
  res.json(live);
}

export async function endLive(req, res) {
  const live = await loadForOwner(req, res);
  if (!live) return;
  if (live.status !== "live") {
    return res.status(400).json({ message: "Class is not live" });
  }
  live.status = "ended";
  live.endedAt = new Date();
  await live.save();

  // sab participants ko room se nikaalo. Room na bana ho to error ignore
  try {
    const httpUrl = process.env.LIVEKIT_URL.replace("wss://", "https://");
    const svc = new RoomServiceClient(
      httpUrl,
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET
    );
    await svc.deleteRoom(roomName(live));
  } catch (err) {
    console.log("deleteRoom skipped:", err.message);
  }
  res.json(live);
}

export async function deleteLive(req, res) {
  const live = await loadForOwner(req, res);
  if (!live) return;
  if (live.status === "live") {
    return res.status(400).json({ message: "End the class before deleting it" });
  }
  await live.deleteOne();
  res.json({ message: "Deleted" });
}

export async function joinToken(req, res) {
  const live = await LiveClass.findById(req.params.id);
  if (!live) return res.status(404).json({ message: "Live class not found" });

  const access = await getAccess(live.course, req.user);
  if (!access.enrolled) return res.status(403).json({ message: "Enroll to join" });
  if (live.status !== "live") {
    return res.status(400).json({ message: "This class is not live right now" });
  }

  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: req.user._id.toString(),
    name: req.user.name,
    ttl: "3h",
  });
  at.addGrant({
    room: roomName(live),
    roomJoin: true,
    canSubscribe: true,
    canPublishData: true,     // chat isi se chalta hai
    canPublish: access.isOwner, // camera/mic sirf instructor ka
  });

  res.json({
    token: await at.toJwt(), // v2 SDK me ye async hai
    url: process.env.LIVEKIT_URL,
    isHost: access.isOwner,
  });
}