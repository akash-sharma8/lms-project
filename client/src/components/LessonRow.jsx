import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

const labels = {
  none: "No video",
  uploaded: "Queued...",
  processing: "Converting...",
  ready: "Ready",
  failed: "Failed",
};

const badgeStyles = {
  none: "bg-gray-100 text-gray-600",
  uploaded: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  processing: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  ready: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  failed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
};

const dotStyles = {
  none: "bg-gray-400",
  uploaded: "bg-amber-500 animate-pulse",
  processing: "bg-amber-500 animate-pulse",
  ready: "bg-emerald-500",
  failed: "bg-red-500",
};

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
    <li className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-gray-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Lesson Number & Title */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-700 ring-1 ring-gray-200">
            {index + 1}
          </span>
          <span className="truncate text-sm font-semibold text-gray-900">
            {lesson.title}
          </span>
        </div>

        {/* Status Pill & Delete Button */}
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyles[status]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status]}`} />
            {labels[status]}
            {status === "ready" && duration ? ` (${duration}s)` : ""}
          </span>

          <button
            type="button"
            onClick={() => onDelete(lesson._id)}
            disabled={busy}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Video Upload Control & Progress Bar */}
      <div className="mt-3 flex flex-col gap-2 border-t border-gray-200/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <label
          className={`inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition ${
            busy
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600"
          }`}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <span>{status === "ready" ? "Replace video" : "Upload video"}</span>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            onChange={handleFile}
            disabled={busy}
            className="hidden"
          />
        </label>

        {percent !== null && (
          <div className="flex flex-1 items-center gap-2.5 sm:max-w-xs">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-200"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-blue-600">
              {percent}%
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">
          {error}
        </div>
      )}
    </li>
  );
}