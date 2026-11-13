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

  if (!current) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
          <div className="flex-1 animate-pulse">
            <div className="aspect-video w-full rounded-2xl bg-gray-200" />
            <div className="mt-5 h-7 w-2/3 rounded-lg bg-gray-200" />
          </div>
          <div className="w-full animate-pulse rounded-2xl border border-gray-200 bg-white p-5 lg:w-80">
            <div className="h-5 w-3/4 rounded bg-gray-200" />
            <div className="mt-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-full rounded-lg bg-gray-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lesson = current.lessons.find((l) => l._id === lessonId);
  const activeIndex = current.lessons.findIndex((l) => l._id === lessonId);

  async function handleEnded() {
    try {
      const { data } = await api.post(`/lessons/${lessonId}/complete`);
      setProgress(data.progress);
    } catch {
      // instructor ke liye ye 403 dega, ignore
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-start">
        {/* Main Video & Lesson Details Area */}
        <div className="flex-1">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 shadow-sm">
            {lesson?.video?.status === "ready" ? (
              <VideoPlayer lessonId={lessonId} onEnded={handleEnded} />
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center bg-gray-900 px-6 text-center text-gray-300">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-gray-400">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.75"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white">
                  This lesson has no video yet
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Video content is currently processing or hasn't been uploaded.
                </p>
              </div>
            )}
          </div>

          {/* Title & Progress Bar Card */}
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Lesson {activeIndex >= 0 ? activeIndex + 1 : 1} of{" "}
                  {current.lessons.length}
                </span>
                <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                  {lesson?.title}
                </h1>
              </div>

              {progress !== null && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                  <div className="text-right">
                    <span className="block text-[11px] font-medium text-emerald-700">
                      Course Progress
                    </span>
                    <span className="text-sm font-bold text-emerald-900">
                      {progress}% Completed
                    </span>
                  </div>
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-emerald-200">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Syllabus Sidebar */}
        <aside className="w-full shrink-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:w-80">
          <Link
            to={`/courses/${courseId}`}
            className="group mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-blue-600"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            Back to course overview
          </Link>

          <h2 className="line-clamp-2 border-b border-gray-100 pb-3.5 text-base font-bold text-gray-900">
            {current.course.title}
          </h2>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Course Content</span>
            <span>{current.lessons.length} lessons</span>
          </div>

          <ol className="mt-3 max-h-[60vh] space-y-1.5 overflow-y-auto pr-1">
            {current.lessons.map((l, index) => {
              const isActive = l._id === lessonId;
              return (
                <li key={l._id}>
                  <Link
                    to={`/learn/${courseId}/${l._id}`}
                    className={`flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                      isActive
                        ? "bg-blue-50 font-semibold text-blue-700 ring-1 ring-blue-600/20"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="line-clamp-2 leading-snug">{l.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </div>
  );
}