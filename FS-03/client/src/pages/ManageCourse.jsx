import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import LessonRow from "../components/LessonRow";
import LiveSection from "../components/LiveSection";

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
      setDetails(
        (d) =>
          d || {
            title: data.course.title,
            description: data.course.description,
            category: data.course.category,
            price: data.course.price,
          }
      );
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
      await api.put(`/courses/${id}`, {
        ...details,
        price: Number(details.price),
      });
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

  if (!course || !details) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {msg ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
              {msg}
            </div>
          ) : (
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 rounded-lg bg-gray-200" />
              <div className="h-72 rounded-2xl border border-gray-200 bg-white p-6" />
              <div className="h-56 rounded-2xl border border-gray-200 bg-white p-6" />
            </div>
          )}
        </div>
      </div>
    );
  }

  const change = (e) =>
    setDetails({ ...details, [e.target.name]: e.target.value });

  const isPublished = course.status === "published";
  const isErrorMsg =
    msg.toLowerCase().includes("failed") ||
    msg.toLowerCase().includes("could not");

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Back Link & Course Status Header */}
        <div>
          <Link
            to="/instructor"
            className="group mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-blue-600"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            Back to my courses
          </Link>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  {course.title}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    isPublished
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                      : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isPublished ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {course.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {isPublished
                  ? "This course is live and visible to students."
                  : "Draft mode — publish when your lessons are ready."}
              </p>
            </div>

            <button
              onClick={togglePublish}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition active:scale-[0.99] ${
                isPublished
                  ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {course.status === "draft" ? "Publish course" : "Move to draft"}
            </button>
          </div>
        </div>

        {/* Status Feedback Toast */}
        {msg && (
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium ${
              isErrorMsg
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isErrorMsg ? "bg-red-500" : "bg-emerald-500"
              }`}
            />
            {msg}
          </div>
        )}

        {/* Course Details Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900">
              Course Details
            </h2>
            <p className="text-xs text-gray-500">
              Update basic information, category, and pricing
            </p>
          </div>

          <form onSubmit={saveDetails} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Course title
              </label>
              <input
                name="title"
                value={details.title}
                onChange={change}
                required
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={details.description}
                onChange={change}
                required
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  name="category"
                  value={details.category}
                  onChange={change}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Price (₹)
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={details.price}
                  onChange={change}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]">
                Save details
              </button>
            </div>
          </form>
        </div>

        {/* Lessons Management Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Course Lessons
              </h2>
              <p className="text-xs text-gray-500">
                Add lessons and upload video lectures
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {lessons.length} {lessons.length === 1 ? "Lesson" : "Lessons"}
            </span>
          </div>

          {lessons.length > 0 ? (
            <ul className="mb-5 space-y-2.5">
              {lessons.map((l, i) => (
                <LessonRow
                  key={l._id}
                  lesson={l}
                  index={i}
                  onDelete={deleteLesson}
                  onChanged={load}
                />
              ))}
            </ul>
          ) : (
            <p className="mb-5 rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-500">
              No lessons yet. Use the field below to add your first lesson.
            </p>
          )}

          <form
            onSubmit={addLesson}
            className="flex flex-col gap-2.5 sm:flex-row"
          >
            <input
              placeholder="Enter new lesson title..."
              value={newLesson}
              onChange={(e) => setNewLesson(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 bg-gray-50/60 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <button className="shrink-0 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.99]">
              + Add lesson
            </button>
          </form>
        </div>

        {/* Quizzes Management Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Course Quizzes
              </h2>
              <p className="text-xs text-gray-500">
                Create practice assessments for enrolled students
              </p>
            </div>

            <Link
              to={`/instructor/courses/${id}/quiz/new`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
            >
              <span>+</span> Add quiz
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-500">
              No quizzes created for this course yet.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {quizzes.map((q) => (
                <li
                  key={q._id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 sm:flex-row sm:items-center"
                >
                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      {q.title}
                    </span>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                      <span>{q.questionCount} questions</span>
                      <span>•</span>
                      <span>Pass mark: {q.passPercent}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteQuiz(q._id)}
                    className="self-start rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:self-auto"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Live Classes Management Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <LiveSection courseId={id} isOwner={true} />
        </div>
      </div>
    </div>
  );
}