import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { fetchMyCourses } from "../features/instructor/instructorSlice";

const empty = { title: "", description: "", category: "General", price: 0 };

export default function InstructorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading } = useSelector((s) => s.instructor);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchMyCourses());
  }, [dispatch]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/courses", { ...form, price: Number(form.price) });
      navigate(`/instructor/courses/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create course");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>My courses</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New course"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ display: "grid", gap: 8, maxWidth: 420, margin: "16px 0" }}>
          <input name="title" placeholder="Course title" value={form.title} onChange={change} required />
          <textarea name="description" placeholder="Description" rows={3} value={form.description} onChange={change} required />
          <input name="category" placeholder="Category" value={form.category} onChange={change} />
          <input name="price" type="number" min="0" placeholder="Price (0 = free)" value={form.price} onChange={change} />
          {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
          <button>Create course</button>
        </form>
      )}

      {loading && <p>Loading...</p>}
      {!loading && courses.length === 0 && <p>You have not created any course yet.</p>}

      {courses.map((c) => (
        <div key={c._id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <b>{c.title}</b>
            <div>
              <small>
                {c.totalLessons} lessons · {c.price === 0 ? "Free" : `₹${c.price}`} ·{" "}
                <span style={{ color: c.status === "published" ? "green" : "#b26a00" }}>{c.status}</span>
              </small>
            </div>
          </div>
          <Link to={`/instructor/courses/${c._id}`}>Manage</Link>
        </div>
      ))}
    </div>
  );
}