import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyEnrollments } from "../features/courses/coursesSlice";

export default function MyLearning() {
  const dispatch = useDispatch();
  const enrollments = useSelector((s) => s.courses.enrollments);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  return (
    <div style={{ padding: 24 }}>
      <h2>My Learning</h2>
      {enrollments.length === 0 && <p>You have not enrolled in any course yet.</p>}
      {enrollments.map((e) => (
        <div key={e._id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 10, borderRadius: 8 }}>
          <Link to={`/courses/${e.course._id}`}><b>{e.course.title}</b></Link>
          <div style={{ background: "#eee", height: 8, borderRadius: 4, margin: "8px 0" }}>
            <div style={{ width: `${e.progress}%`, background: "#4caf50", height: 8, borderRadius: 4 }} />
          </div>
          <small>{e.progress}% complete</small>
        </div>
      ))}
    </div>
  );
}