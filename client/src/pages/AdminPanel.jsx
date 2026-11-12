import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const rupee = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function StatCard({ label, value, accent }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        accent
          ? "border-blue-200 bg-blue-50/40"
          : "border-gray-200 bg-white"
      }`}
    >
      <span className="block text-xs font-medium text-gray-500">{label}</span>
      <div
        className={`mt-2 text-2xl font-bold tracking-tight ${
          accent ? "text-blue-600" : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState("users");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  const loadStats = useCallback(async () => {
    const { data } = await api.get("/admin/stats");
    setStats(data);
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await api.get("/admin/users", { params: { search } });
    setUsers(data);
  }, [search]);

  const loadCourses = useCallback(async () => {
    const { data } = await api.get("/admin/courses");
    setCourses(data);
  }, []);

  useEffect(() => {
    loadStats();
    loadCourses();
  }, [loadStats, loadCourses]);

  // search type karte waqt har key par request na jaye
  useEffect(() => {
    const t = setTimeout(loadUsers, 300);
    return () => clearTimeout(t);
  }, [loadUsers]);

  // har action ek jaisa: try, message dikhao, data refresh karo
  async function run(fn, okText) {
    setMsg("");
    try {
      await fn();
      setMsg(okText);
      loadStats();
      loadUsers();
      loadCourses();
    } catch (err) {
      setMsg(err.response?.data?.message || "Action failed");
    }
  }

  const setRole = (u, role) =>
    run(() => api.patch(`/admin/users/${u._id}/role`, { role }), `${u.name} is now ${role}`);

  const removeUser = (u) => {
    if (!window.confirm(`Delete ${u.name}? Their enrollments and quiz attempts will be removed.`)) return;
    run(() => api.delete(`/admin/users/${u._id}`), "User deleted");
  };

  const toggleCourse = (c) =>
    run(() => api.patch(`/courses/${c._id}/publish`), `"${c.title}" status changed`);

  const removeCourse = (c) => {
    if (!window.confirm(`Delete "${c.title}" and its lessons?`)) return;
    run(() => api.delete(`/courses/${c._id}`), "Course deleted");
  };

  const isErrorMsg = msg.toLowerCase().includes("failed");

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage platform users, instructor permissions, and published courses
          </p>
        </div>

        {/* Platform KPI Cards */}
        {stats ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total users" value={stats.users} />
            <StatCard
              label="Courses"
              value={`${stats.published}/${stats.courses} live`}
            />
            <StatCard label="Enrollments" value={stats.enrollments} />
            <StatCard label="Gross sales" value={rupee(stats.gross)} />
            <StatCard
              label="Platform fee"
              value={rupee(stats.platformFee)}
              accent
            />
          </div>
        ) : (
          <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, idx) => (
              <div
                key={idx}
                className="h-24 rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="h-3.5 w-20 rounded bg-gray-200" />
                <div className="mt-3 h-7 w-24 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {/* Tabs & Status Banner */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Segmented Tab Switcher */}
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setTab("users")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  tab === "users"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setTab("courses")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  tab === "courses"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Courses ({courses.length})
              </button>
            </div>

            {/* Action Feedback Toast */}
            {msg && (
              <div
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium ${
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
          </div>

          {/* Users Tab */}
          {tab === "users" && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center">
                <h2 className="text-base font-bold text-gray-900">
                  Registered Users
                </h2>

                <div className="relative w-full sm:w-72">
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50/60 py-2 pl-9 pr-3.5 text-xs text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              {users.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-500">
                  No matching users found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <th className="px-6 py-3.5">User</th>
                        <th className="px-4 py-3.5">Role</th>
                        <th className="px-4 py-3.5">Joined</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((u) => (
                        <tr
                          key={u._id}
                          className="transition-colors hover:bg-gray-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                              </span>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {u.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                u.role === "admin"
                                  ? "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20"
                                  : u.role === "instructor"
                                  ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-xs text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4 text-right">
                            {u.role !== "admin" ? (
                              <div className="inline-flex items-center gap-2">
                                <select
                                  value={u.role}
                                  onChange={(e) => setRole(u, e.target.value)}
                                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                >
                                  <option value="student">student</option>
                                  <option value="instructor">instructor</option>
                                </select>

                                <button
                                  onClick={() => removeUser(u)}
                                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs italic text-gray-400">
                                Protected
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {tab === "courses" && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-base font-bold text-gray-900">
                  All Platform Courses
                </h2>
              </div>

              {courses.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-500">
                  No courses available on the platform yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <th className="px-6 py-3.5">Course</th>
                        <th className="px-4 py-3.5">Instructor</th>
                        <th className="px-4 py-3.5">Price</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {courses.map((c) => {
                        const isPublished = c.status === "published";
                        return (
                          <tr
                            key={c._id}
                            className="transition-colors hover:bg-gray-50/70"
                          >
                            <td className="px-6 py-4 font-semibold text-gray-900">
                              {c.title}
                            </td>
                            <td className="px-4 py-4 text-gray-600">
                              {c.instructor?.name || "—"}
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-900">
                              {c.price === 0 ? (
                                <span className="font-semibold text-emerald-600">
                                  Free
                                </span>
                              ) : (
                                rupee(c.price)
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                  isPublished
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                                    : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isPublished
                                      ? "bg-emerald-500"
                                      : "bg-amber-500"
                                  }`}
                                />
                                {c.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => toggleCourse(c)}
                                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                    isPublished
                                      ? "border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100"
                                      : "border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100"
                                  }`}
                                >
                                  {isPublished ? "Unpublish" : "Publish"}
                                </button>
                                <button
                                  onClick={() => removeCourse(c)}
                                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}