import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { fetchMyCourses } from "../features/instructor/instructorSlice";

const empty = { title: "", description: "", category: "General", price: 0 };

export default function InstructorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading } = useSelector((s) => s.instructor);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchMyCourses());
  }, [dispatch]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/courses", { ...form, price: Number(form.price) });
      navigate(`/instructor/courses/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create course");
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              My Courses
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, update, and manage your published content
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.99] ${
              showForm
                ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {showForm ? (
              <>
                <span>✕</span> Cancel
              </>
            ) : (
              <>
                <span>+</span> New Course
              </>
            )}
          </button>
        </div>

        {/* Collapsible Create Course Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900">
              Create a new course
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Course title
                </label>
                <input
                  name="title"
                  placeholder="e.g. Complete React & Redux Bootcamp"
                  value={form.title}
                  onChange={change}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="What will students learn in this course?"
                  rows={3}
                  value={form.description}
                  onChange={change}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    name="category"
                    placeholder="e.g. Web Development"
                    value={form.category}
                    onChange={change}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
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
                    placeholder="0 for free"
                    value={form.price}
                    onChange={change}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]">
                  Create course
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="flex animate-pulse items-center justify-between rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="space-y-2.5">
                  <div className="h-5 w-56 rounded bg-gray-200" />
                  <div className="h-3.5 w-36 rounded bg-gray-100" />
                </div>
                <div className="h-9 w-24 rounded-lg bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">
              No courses created yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Get started by clicking the "+ New Course" button above to build your first curriculum.
            </p>
          </div>
        )}

        {/* Course List */}
        {!loading && courses.length > 0 && (
          <div className="space-y-3">
            {courses.map((c) => {
              const isPublished = c.status === "published";
              return (
                <div
                  key={c._id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-gray-900">
                        {c.title}
                      </h3>
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
                        {c.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
                      <span>{c.totalLessons} lessons</span>
                      <span>•</span>
                      <span className={c.price === 0 ? "text-emerald-600 font-semibold" : "text-gray-700"}>
                        {c.price === 0 ? "Free" : `₹${c.price}`}
                      </span>
                      {c.category && (
                        <>
                          <span>•</span>
                          <span>{c.category}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/instructor/courses/${c._id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Manage
                    <span>→</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}