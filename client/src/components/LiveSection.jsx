import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const badge = {
  scheduled: {
    text: "Scheduled",
    style: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
    dot: "bg-amber-500",
  },
  live: {
    text: "LIVE",
    style: "bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/20",
    dot: "bg-red-600 animate-pulse",
  },
  ended: {
    text: "Ended",
    style: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
};

export default function LiveSection({ courseId, isOwner }) {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: "", scheduledAt: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}/live`);
      setList(data);
    } catch {
      // network atka to purani list rehne do, agle round me dobara try hoga
    }
  }, [courseId]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [load]);

  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/courses/${courseId}/live`, {
        title: form.title,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });
      setForm({ title: "", scheduledAt: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not schedule");
    }
  }

  // start/end/delete teeno same shape ke hain
  async function act(id, action) {
    setError("");
    try {
      if (action === "delete") await api.delete(`/live/${id}`);
      else await api.post(`/live/${id}/${action}`);
      if (action === "start") return navigate(`/live/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    }
  }

  // student ke liye koi class nahi hai to poora section hi mat dikhao
  if (!isOwner && list.length === 0) return null;

  // student view me card ki styling yahin se aati hai, instructor ka wrapper
  // ManageCourse page apna khud sambhalta hai
  const wrapperClass = isOwner
    ? ""
    : "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8";

  return (
    <div className={wrapperClass}>
      <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Live Classes</h3>
          <p className="text-xs text-gray-500">
            {isOwner
              ? "Schedule and host real-time interactive video sessions"
              : "Join scheduled live sessions with your instructor"}
          </p>
        </div>
        {list.length > 0 && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {list.length} {list.length === 1 ? "Session" : "Sessions"}
          </span>
        )}
      </div>

      {isOwner && (
        <form
          onSubmit={create}
          className="mb-5 flex flex-col gap-2.5 sm:flex-row sm:items-center"
        >
          <input
            placeholder="Live session title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="flex-1 rounded-xl border border-gray-300 bg-gray-50/60 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            required
            className="rounded-xl border border-gray-300 bg-gray-50/60 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
          <button className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]">
            Schedule
          </button>
        </form>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-500">
          No live classes scheduled yet.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {list.map((c) => {
            const currentBadge = badge[c.status] || badge.ended;
            return (
              <li
                key={c._id}
                className={`flex flex-col justify-between gap-3 rounded-xl border px-4 py-3.5 transition sm:flex-row sm:items-center ${
                  c.status === "live"
                    ? "border-red-200 bg-red-50/20"
                    : "border-gray-200 bg-gray-50/50"
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm font-semibold text-gray-900">
                      {c.title}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${currentBadge.style}`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span
                          className={`inline-flex h-full w-full rounded-full ${currentBadge.dot}`}
                        />
                      </span>
                      {currentBadge.text}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(c.scheduledAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {c.status === "live" && (
                    <button
                      onClick={() => navigate(`/live/${c._id}`)}
                      className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.99]"
                    >
                      Join live
                    </button>
                  )}

                  {isOwner && c.status === "scheduled" && (
                    <button
                      onClick={() => act(c._id, "start")}
                      className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99]"
                    >
                      Start class
                    </button>
                  )}

                  {isOwner && c.status === "live" && (
                    <button
                      onClick={() => act(c._id, "end")}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      End class
                    </button>
                  )}

                  {isOwner && c.status !== "live" && (
                    <button
                      onClick={() => act(c._id, "delete")}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}