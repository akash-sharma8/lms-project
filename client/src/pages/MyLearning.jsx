import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { fetchMyEnrollments } from "../features/courses/coursesSlice";

export default function MyLearning() {
  const dispatch = useDispatch();
  const enrollments = useSelector((s) => s.courses.enrollments);
  const [msg, setMsg] = useState({}); // courseId -> error text

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
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              My Learning
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Continue where you left off and download your earned certificates
            </p>
          </div>

          {enrollments.length > 0 && (
            <span className="self-start rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm sm:self-auto">
              {enrollments.length}{" "}
              {enrollments.length === 1 ? "Enrolled Course" : "Enrolled Courses"}
            </span>
          )}
        </div>

        {/* Empty State */}
        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
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
                  d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">
              You haven't enrolled in any courses yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Browse our catalog to find courses and start tracking your learning progress.
            </p>
            <Link
              to="/"
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          /* Enrolled Courses Grid */
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {enrollments.map((e) => {
              const isCompleted = e.progress === 100;
              return (
                <div
                  key={e._id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/courses/${e.course._id}`}
                        className="line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors hover:text-blue-600"
                      >
                        {e.course.title}
                      </Link>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {isCompleted ? "Completed" : "In progress"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5">
                      <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-500">Course progress</span>
                        <span
                          className={`font-bold ${
                            isCompleted ? "text-emerald-600" : "text-gray-800"
                          }`}
                        >
                          {e.progress}%
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? "bg-emerald-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${e.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    {isCompleted ? (
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <button
                            onClick={() => getCertificate(e)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99]"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                              />
                            </svg>
                            {e.certificateId
                              ? "Download certificate"
                              : "Get certificate"}
                          </button>

                          <div className="flex items-center gap-3 text-xs font-semibold">
                            {e.certificateId && (
                              <Link
                                to={`/verify/${e.certificateId}`}
                                className="text-gray-600 transition-colors hover:text-blue-600 hover:underline"
                              >
                                Verify page
                              </Link>
                            )}
                            <Link
                              to={`/courses/${e.course._id}`}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Review →
                            </Link>
                          </div>
                        </div>

                        {msg[e.course._id] && (
                          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                            {msg[e.course._id]}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <Link
                          to={`/courses/${e.course._id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          Continue learning
                          <span>→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}