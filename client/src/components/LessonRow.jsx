import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

const labels = {
  none: "No video",
  uploaded: "Queued...",
  processing: "Converting...",
  ready: "Ready",
  failed: "Failed",
};
const colors = { none: "#777", uploaded: "#b26a00", processing: "#b26a00", ready: "green", failed: "crimson" };

export default function LessonRow({ lesson, index, onDelete, onChanged }) {
  const [status, setStatus] = useState(lesson.video?.status || "none");
  const [duration, setDuration] = useState(lesson.video?.duration);
  const [percent, setPercent] = useState(null); // upload progress
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  // queue ya processing mein hai to status poochte raho
  useEffect(() => {
    if (status !== "uploaded" && status !== "processing") return;

    const timer = setInterval(async () => {
      try {
        const { data } = await api.get(`/lessons/${lesson._id}/video/status`);
        setStatus(data.status);
        if (data.duration) setDuration(data.duration);
        if (data.status === "ready" || data.status === "failed") onChanged();
      } catch {
        // network atka to agle round mein dobara try hoga
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [status, lesson._id, onChanged]);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");

    const body = new FormData();
    body.append("video", file); // key ka naam backend se match hona chahiye

    try {
      await api.post(`/lessons/${lesson._id}/video`, body, {
        onUploadProgress: (p) => {
          if (p.total) setPercent(Math.round((p.loaded / p.total) * 100));
        },
      });
      setStatus("uploaded");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setPercent(null);
      fileRef.current.value = "";
    }
  }

  const busy = percent !== null || status === "processing" || status === "uploaded";

  return (
    <li style={{ margin: "10px 0", padding: 10, border: "1px solid #eee", borderRadius: 6 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <b style={{ flex: 1 }}>{index + 1}. {lesson.title}</b>
        <small style={{ color: colors[status] }}>
          {labels[status]}{status === "ready" && duration ? ` (${duration}s)` : ""}
        </small>
        <button onClick={() => onDelete(lesson._id)} disabled={busy}>Delete</button>
      </div>

      <div style={{ marginTop: 6 }}>
        <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} disabled={busy} />
        {percent !== null && <small> Uploading {percent}%</small>}
      </div>
      {error && <small style={{ color: "crimson" }}>{error}</small>}
    </li>
  );
}