import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
          <div className="rounded-lg bg-blue-600 px-2.5 py-1 text-sm font-bold tracking-wider text-white">
            LMS
          </div>
          <span className="text-lg font-bold text-gray-900">EduPortal</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {user?.role === "student" && (
            <Link
              to="/my-learning"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              My Learning
            </Link>
          )}

          {user && user.role !== "student" && (
            <Link
              to="/instructor"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              Dashboard
            </Link>
          )}

          {user && user.role !== "student" && (
            <Link
              to="/instructor/earnings"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              Earnings
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              Admin
            </Link>
          )}
        </div>

        {/* User Section */}
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center gap-3.5 rounded-full border border-gray-100 bg-gray-50 py-1.5 pl-3 pr-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                {userInitial}
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold text-gray-800">
                  {user.name}
                </span>
                <span className="text-[11px] text-gray-500 capitalize">
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-full border border-gray-300 bg-white px-3.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-4.5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}