import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import VideoPlayer from "../components/VideoPlayer";
import { fetchCourse } from "../features/courses/coursesSlice";

export default function Learn() {
  const { courseId, lessonId } = useParams();
  const dispatch = useDispatch();
  const current = useSelector((s) => s.courses.current);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    dispatch(fetchCourse(courseId));
  }, [courseId, dispatch]);

  if (!current) return <p style={{ padding: 24 }}>Loading...</p>;
  const lesson = current.lessons.find((l) => l._id === lessonId);

  async function handleEnded() {
    try {
      const { data } = await api.post(`/lessons/${lessonId}/complete`);
      setProgress(data.progress);
    } catch {
      // instructor ke liye ye 403 dega, ignore
    }
  }

  return (
    <div style={{ display: "flex", gap: 24, padding: 24 }}>
      <div style={{ flex: 1 }}>
        <h2>{lesson?.title}</h2>
        {lesson?.video?.status === "ready" ? (
          <VideoPlayer lessonId={lessonId} onEnded={handleEnded} />
        ) : (
          <p>This lesson has no video yet.</p>
        )}
        {progress !== null && <p>Course progress: {progress}%</p>}
      </div>

      <aside style={{ width: 240 }}>
        <Link to={`/courses/${courseId}`}>← {current.course.title}</Link>
        <ol>
          {current.lessons.map((l) => (
            <li key={l._id} style={{ fontWeight: l._id === lessonId ? "bold" : "normal" }}>
              <Link to={`/learn/${courseId}/${l._id}`}>{l.title}</Link>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}