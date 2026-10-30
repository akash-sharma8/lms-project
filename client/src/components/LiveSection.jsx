import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const badge = {
  scheduled: { text: "Scheduled", color: "#b26a00" },
  live: { text: "LIVE", color: "crimson" },
  ended: { text: "Ended", color: "#777" },
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
      setList([]);
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

  if (!isOwner && list.length === 0) return null;

  return (
    <div>
      <h3>Live classes</h3>

      {isOwner && (
        <form onSubmit={create} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <input
            placeholder="Class title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            required
          />
          <button>Schedule</button>
        </form>
      )}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {list.length === 0 && <p>No live classes scheduled.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {list.map((c) => (
          <li key={c._id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #eee" }}>
            <div style={{ flex: 1 }}>
              <b>{c.title}</b>
              <div><small>{new Date(c.scheduledAt).toLocaleString()}</small></div>
            </div>
            <small style={{ color: badge[c.status].color, fontWeight: "bold" }}>{badge[c.status].text}</small>

            {c.status === "live" && (
              <button onClick={() => navigate(`/live/${c._id}`)}>Join</button>
            )}
            {isOwner && c.status === "scheduled" && (
              <button onClick={() => act(c._id, "start")}>Start</button>
            )}
            {isOwner && c.status === "live" && (
              <button onClick={() => act(c._id, "end")}>End</button>
            )}
            {isOwner && c.status !== "live" && (
              <button onClick={() => act(c._id, "delete")}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}