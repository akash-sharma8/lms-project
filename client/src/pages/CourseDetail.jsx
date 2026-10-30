import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { fetchCourse, fetchMyEnrollments } from "../features/courses/coursesSlice";
import LiveSection from "../components/LiveSection";
import { payForCourse } from "../utils/razorpay";

export default function CourseDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { current, enrollments } = useSelector((s) => s.courses);
  const [msg, setMsg] = useState("");
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    dispatch(fetchCourse(id));
    if (user) dispatch(fetchMyEnrollments());
  }, [id, user, dispatch]);

  useEffect(() => {
    const allowed = enrolled || (user && user.role !== "student");
    if (!allowed) {
      setQuizzes([]);
      return;
    }
    api.get(`/courses/${id}/quizzes`).then(({ data }) => setQuizzes(data)).catch(() => setQuizzes([]));
  }, [id, user, enrollments]);

  const enrolled = enrollments.some((e) => e.course?._id === id);
  if (!current) return <p style={{ padding: 24 }}>Loading...</p>;
  const { course, lessons } = current;

  async function handleEnroll() {
    if (!user) return navigate("/login");
    setMsg("");
    try {
      if (course.price > 0) await payForCourse(id, user);
      else await api.post(`/courses/${id}/enroll`);
      dispatch(fetchMyEnrollments());
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || "Could not enroll");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>by {course.instructor?.name} · {course.price === 0 ? "Free" : `₹${course.price}`}</p>

      {user?.role === "student" && !enrolled && (
        <button onClick={handleEnroll}>
          {course.price > 0 ? `Buy for ₹${course.price}` : "Enroll now"}
        </button>
      )}
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
        {quizzes.length > 0 && (
          <>
            <h3>Quizzes</h3>
            <ul>
              {quizzes.map((q) => (
                <li key={q._id}>
                  <Link to={`/quiz/${q._id}`}>{q.title}</Link>{" "}
                  <small>
                    ({q.questionCount} questions, pass {q.passPercent}%)
                    {q.bestPercent != null && ` · best: ${q.bestPercent}% ${q.passed ? "✓" : ""}`}
                  </small>
                </li>
              ))}
            </ul>
            <LiveSection courseId={id} isOwner={false} />
          </>
        )}
      </ol>
    </div>
  );
}