import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { fetchMyEnrollments } from "../features/courses/coursesSlice";

export default function MyLearning() {
  const dispatch = useDispatch();
  const enrollments = useSelector((s) => s.courses.enrollments);
  const [msg, setMsg] = useState({});   // courseId -> error text

  useEffect(() => {
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  async function getCertificate(e) {
    const courseId = e.course._id;
    setMsg((m) => ({ ...m, [courseId]: "" }));
    try {
      let certId = e.certificateId;
      if (!certId) {
        const { data } = await api.post(`/enrollments/${courseId}/certificate`);
        certId = data.certificateId;
        dispatch(fetchMyEnrollments());
      }
      // PDF ke liye Authorization header chahiye, isliye blob bana kar download karte hain
      const res = await api.get(`/certificates/${certId}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${certId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMsg((m) => ({
        ...m,
        [courseId]: err.response?.data?.message || "Could not get certificate",
      }));
    }
  }

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

          {e.progress === 100 && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => getCertificate(e)}>
                {e.certificateId ? "Download certificate" : "Get certificate"}
              </button>
              {e.certificateId && (
                <small>
                  {" "}· <Link to={`/verify/${e.certificateId}`}>verify page</Link>
                </small>
              )}
              {msg[e.course._id] && (
                <p style={{ color: "crimson", margin: "6px 0 0" }}>{msg[e.course._id]}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}