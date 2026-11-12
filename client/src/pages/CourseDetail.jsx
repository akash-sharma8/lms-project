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

  const enrolled = enrollments.some((e) => e.course?._id === id);
  const canAccessContent = enrolled || (user && user.role !== "student");

  useEffect(() => {
    dispatch(fetchCourse(id));
    if (user) dispatch(fetchMyEnrollments());
  }, [id, user, dispatch]);

  useEffect(() => {
    if (!canAccessContent) {
      setQuizzes([]);
      return;
    }
    api
      .get(`/courses/${id}/quizzes`)
      .then(({ data }) => setQuizzes(data))
      .catch(() => setQuizzes([]));
  }, [id, canAccessContent]);

  if (!current) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <div className="h-5 w-24 rounded-md bg-gray-200" />
            <div className="mt-4 h-8 w-2/3 rounded-lg bg-gray-200" />
            <div className="mt-3 h-4 w-full rounded bg-gray-100" />
            <div className="mt-2 h-4 w-4/5 rounded bg-gray-100" />
            <div className="mt-6 h-10 w-36 rounded-xl bg-gray-200" />
          </div>
          <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="h-6 w-40 rounded bg-gray-200" />
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-12 w-full rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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

  const enrollButtonClass =
    "rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back link */}
        <Link
          to="/"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-blue-600"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Back to courses
        </Link>

        {/* Course header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-2.5">
            {course.category && (
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                {course.category}
              </span>
            )}
            <span className="text-xs font-medium text-gray-500">
              {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {course.title}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
            {course.description}
          </p>

          {/* Instructor and enroll area */}
          <div className="mt-6 flex flex-col justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {course.instructor?.name
                  ? course.instructor.name.charAt(0).toUpperCase()
                  : "I"}
              </div>
              <div>
                <span className="block text-xs text-gray-500">Created by</span>
                <span className="text-sm font-semibold text-gray-900">
                  {course.instructor?.name || "Instructor"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="text-left sm:text-right">
                <span className="block text-xs text-gray-500">Course fee</span>
                <span
                  className={`text-xl font-bold ${
                    course.price === 0 ? "text-emerald-600" : "text-gray-900"
                  }`}
                >
                  {course.price === 0 ? "Free" : `₹${course.price}`}
                </span>
              </div>

              {user?.role === "student" && !enrolled && (
                <button onClick={handleEnroll} className={enrollButtonClass}>
                  {course.price > 0 ? `Buy for ₹${course.price}` : "Enroll now"}
                </button>
              )}

              {!user && (
                <button onClick={handleEnroll} className={enrollButtonClass}>
                  {course.price > 0
                    ? `Login to buy (₹${course.price})`
                    : "Login to enroll"}
                </button>
              )}

              {enrolled && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  You are enrolled
                </span>
              )}
            </div>
          </div>

          {msg && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
              {msg}
            </div>
          )}
        </div>

        {/* Lessons */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Course Curriculum
              </h2>
              <p className="text-xs text-gray-500">
                {canAccessContent
                  ? "Select any lesson below to start watching"
                  : "Enroll in this course to unlock lesson videos"}
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {lessons.length} {lessons.length === 1 ? "Lesson" : "Lessons"}
            </span>
          </div>

          {lessons.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500">
              No lessons have been added to this course yet.
            </p>
          ) : (
            <ol className="space-y-2.5">
              {lessons.map((l, idx) => {
                const isReady = l.video?.status === "ready";
                const rowContent = (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          canAccessContent
                            ? "bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`truncate text-sm font-medium ${
                          canAccessContent
                            ? "text-gray-900 transition-colors group-hover:text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {l.title}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {!isReady && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                          No video yet
                        </span>
                      )}
                      {canAccessContent ? (
                        <span className="text-xs font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                          Watch →
                        </span>
                      ) : (
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.75"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                );

                return (
                  <li key={l._id}>
                    {canAccessContent ? (
                      <Link
                        to={`/learn/${id}/${l._id}`}
                        className="group block rounded-xl border border-gray-200 bg-white px-4 py-3.5 transition hover:border-blue-200 hover:bg-blue-50/30"
                      >
                        {rowContent}
                      </Link>
                    ) : (
                      <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3.5">
                        {rowContent}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Quizzes */}
        {quizzes.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Practice Quizzes
                </h2>
                <p className="text-xs text-gray-500">
                  Test your understanding with graded assessments
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {quizzes.length} {quizzes.length === 1 ? "Quiz" : "Quizzes"}
              </span>
            </div>

            <ul className="space-y-2.5">
              {quizzes.map((q) => (
                <li key={q._id}>
                  <Link
                    to={`/quiz/${q._id}`}
                    className="group flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/30 sm:flex-row sm:items-center"
                  >
                    <div>
                      <span className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                        {q.title}
                      </span>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>{q.questionCount} questions</span>
                        <span>•</span>
                        <span>Pass mark: {q.passPercent}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {q.bestPercent != null && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                            q.passed
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          Best: {q.bestPercent}% {q.passed && "✓"}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-indigo-600">
                        Start quiz →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Live classes: LiveSection apna card khud banata hai */}
        {canAccessContent && <LiveSection courseId={id} isOwner={false} />}
      </div>
    </div>
  );
}