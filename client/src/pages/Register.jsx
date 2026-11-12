import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../features/auth/authSlice";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const { loading, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) navigate("/");
  }

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white">
            LMS
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
          <p className="mt-1.5 text-sm text-gray-500">
            Join EduPortal to start learning or sharing your skills
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              name="name"
              placeholder="Aman Sharma"
              value={form.name}
              onChange={change}
              required
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              name="email"
              type="email"
              placeholder="aman@lms.com"
              value={form.email}
              onChange={change}
              required
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={change}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              I am joining as
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "student" })}
                className={`rounded-xl border px-3.5 py-2.5 text-left transition ${
                  form.role === "student"
                    ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span
                  className={`block text-xs font-semibold ${
                    form.role === "student" ? "text-blue-700" : "text-gray-900"
                  }`}
                >
                  Student
                </span>
                <span className="mt-0.5 block text-[11px] text-gray-500">
                  I want to learn
                </span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: "instructor" })}
                className={`rounded-xl border px-3.5 py-2.5 text-left transition ${
                  form.role === "instructor"
                    ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span
                  className={`block text-xs font-semibold ${
                    form.role === "instructor"
                      ? "text-blue-700"
                      : "text-gray-900"
                  }`}
                >
                  Instructor
                </span>
                <span className="mt-0.5 block text-[11px] text-gray-500">
                  I want to teach
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}