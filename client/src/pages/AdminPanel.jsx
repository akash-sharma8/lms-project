import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const rupee = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function Card({ label, value }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, minWidth: 130 }}>
      <small style={{ color: "#666" }}>{label}</small>
      <div style={{ fontSize: 22, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState("users");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  const loadStats = useCallback(async () => {
    const { data } = await api.get("/admin/stats");
    setStats(data);
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await api.get("/admin/users", { params: { search } });
    setUsers(data);
  }, [search]);

  const loadCourses = useCallback(async () => {
    const { data } = await api.get("/admin/courses");
    setCourses(data);
  }, []);

  useEffect(() => {
    loadStats();
    loadCourses();
  }, [loadStats, loadCourses]);

  // search type karte waqt har key par request na jaye
  useEffect(() => {
    const t = setTimeout(loadUsers, 300);
    return () => clearTimeout(t);
  }, [loadUsers]);

  // har action ek jaisa: try, message dikhao, data refresh karo
  async function run(fn, okText) {
    setMsg("");
    try {
      await fn();
      setMsg(okText);
      loadStats();
      loadUsers();
      loadCourses();
    } catch (err) {
      setMsg(err.response?.data?.message || "Action failed");
    }
  }

  const setRole = (u, role) =>
    run(() => api.patch(`/admin/users/${u._id}/role`, { role }), `${u.name} is now ${role}`);

  const removeUser = (u) => {
    if (!window.confirm(`Delete ${u.name}? Their enrollments and quiz attempts will be removed.`)) return;
    run(() => api.delete(`/admin/users/${u._id}`), "User deleted");
  };

  const toggleCourse = (c) =>
    run(() => api.patch(`/courses/${c._id}/publish`), `"${c.title}" status changed`);

  const removeCourse = (c) => {
    if (!window.confirm(`Delete "${c.title}" and its lessons?`)) return;
    run(() => api.delete(`/courses/${c._id}`), "Course deleted");
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h2>Admin panel</h2>

      {stats && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Card label="Users" value={stats.users} />
          <Card label="Courses" value={`${stats.published}/${stats.courses} live`} />
          <Card label="Enrollments" value={stats.enrollments} />
          <Card label="Gross sales" value={rupee(stats.gross)} />
          <Card label="Platform fee" value={rupee(stats.platformFee)} />
        </div>
      )}

      <div style={{ margin: "20px 0 10px", display: "flex", gap: 8 }}>
        <button onClick={() => setTab("users")} disabled={tab === "users"}>Users</button>
        <button onClick={() => setTab("courses")} disabled={tab === "courses"}>Courses</button>
      </div>
      {msg && <p style={{ color: "#555" }}>{msg}</p>}

      {tab === "users" && (
        <>
          <input
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: 6, width: 260, marginBottom: 10 }}
          />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.role !== "admin" && (
                      <>
                        <select value={u.role} onChange={(e) => setRole(u, e.target.value)}>
                          <option value="student">student</option>
                          <option value="instructor">instructor</option>
                        </select>{" "}
                        <button onClick={() => removeUser(u)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === "courses" && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              <th>Title</th><th>Instructor</th><th>Price</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c._id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{c.title}</td>
                <td>{c.instructor?.name}</td>
                <td>{c.price === 0 ? "Free" : rupee(c.price)}</td>
                <td style={{ color: c.status === "published" ? "green" : "#b26a00" }}>{c.status}</td>
                <td>
                  <button onClick={() => toggleCourse(c)}>
                    {c.status === "published" ? "Unpublish" : "Publish"}
                  </button>{" "}
                  <button onClick={() => removeCourse(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}