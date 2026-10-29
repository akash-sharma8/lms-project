import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { fetchCourse, fetchMyEnrollments } from "../features/courses/coursesSlice";

export default function CourseDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { current, enrollments } = useSelector((s) => s.courses);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    dispatch(fetchCourse(id));
    if (user) dispatch(fetchMyEnrollments());
  }, [id, user, dispatch]);

  if (!current) return <p style={{ padding: 24 }}>Loading...</p>;
  const { course, lessons } = current;
  const enrolled = enrollments.some((e) => e.course?._id === id);

  async function handleEnroll() {
    if (!user) return navigate("/login");
    try {
      await api.post(`/courses/${id}/enroll`);
      dispatch(fetchMyEnrollments());
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not enroll");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>by {course.instructor?.name} · {course.price === 0 ? "Free" : `₹${course.price}`}</p>

      {user?.role === "student" && !enrolled && <button onClick={handleEnroll}>Enroll now</button>}
      {enrolled && <b style={{ color: "green" }}>You are enrolled</b>}
      {msg && <p style={{ color: "crimson" }}>{msg}</p>}

      <h3>Lessons ({lessons.length})</h3>
      <ol>
        {lessons.map((l) => (
          <li key={l._id}>
            {enrolled || user?.role !== "student" ? (
              <Link to={`/learn/${id}/${l._id}`}>{l.title}</Link>
            ) : (
              l.title
            )}
            {l.video?.status !== "ready" && <small> (no video yet)</small>}
          </li>
        ))}
      </ol>
    </div>
  );
}