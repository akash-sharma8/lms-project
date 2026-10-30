import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import LessonRow from "../components/LessonRow";

export default function ManageCourse() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [details, setDetails] = useState(null);
  const [newLesson, setNewLesson] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data.course);
      setLessons(data.lessons);
      setDetails((d) => d || {
        title: data.course.title,
        description: data.course.description,
        category: data.course.category,
        price: data.course.price,
      });
      const q = await api.get(`/courses/${id}/quizzes`);
      setQuizzes(q.data);
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not load course");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveDetails(e) {
    e.preventDefault();
    try {
      await api.put(`/courses/${id}`, { ...details, price: Number(details.price) });
      setMsg("Saved");
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Save failed");
    }
  }

  async function togglePublish() {
    try {
      await api.patch(`/courses/${id}/publish`);
      setMsg("");
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not change status");
    }
  }

  async function addLesson(e) {
    e.preventDefault();
    if (!newLesson.trim()) return;
    try {
      await api.post(`/courses/${id}/lessons`, { title: newLesson });
      setNewLesson("");
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not add lesson");
    }
  }

  async function deleteLesson(lessonId) {
    if (!window.confirm("Delete this lesson?")) return;
    await api.delete(`/lessons/${lessonId}`);
    load();
  }

  async function deleteQuiz(quizId) {
    if (!window.confirm("Delete this quiz and all its attempts?")) return;
    await api.delete(`/quizzes/${quizId}`);
    load();
  }

  if (!course || !details) return <p style={{ padding: 24 }}>{msg || "Loading..."}</p>;

  const change = (e) => setDetails({ ...details, [e.target.name]: e.target.value });

  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      <Link to="/instructor">← My courses</Link>
      <h2>{course.title}</h2>

      <p>
        Status:{" "}
        <b style={{ color: course.status === "published" ? "green" : "#b26a00" }}>{course.status}</b>{" "}
        <button onClick={togglePublish}>
          {course.status === "draft" ? "Publish" : "Move to draft"}
        </button>
      </p>
      {msg && <p style={{ color: "#555" }}>{msg}</p>}

      <h3>Details</h3>
      <form onSubmit={saveDetails} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <input name="title" value={details.title} onChange={change} required />
        <textarea name="description" rows={3} value={details.description} onChange={change} required />
        <input name="category" value={details.category} onChange={change} />
        <input name="price" type="number" min="0" value={details.price} onChange={change} />
        <button>Save details</button>
      </form>

      <h3>Lessons ({lessons.length})</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {lessons.map((l, i) => (
          <LessonRow key={l._id} lesson={l} index={i} onDelete={deleteLesson} onChanged={load} />
        ))}
      </ul>
      <form onSubmit={addLesson} style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="New lesson title"
          value={newLesson}
          onChange={(e) => setNewLesson(e.target.value)}
          style={{ flex: 1 }}
        />
        <button>Add lesson</button>
      </form>

      <h3>Quizzes</h3>
      {quizzes.length === 0 && <p>No quizzes yet.</p>}
      <ul>
        {quizzes.map((q) => (
          <li key={q._id}>
            {q.title} <small>({q.questionCount} questions, pass {q.passPercent}%)</small>{" "}
            <button onClick={() => deleteQuiz(q._id)}>Delete</button>
          </li>
        ))}
      </ul>
      <Link to={`/instructor/courses/${id}/quiz/new`}>+ Add quiz</Link>
    </div>
  );
}