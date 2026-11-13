import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCourses } from "../features/courses/coursesSlice";

export default function Courses() {
  const [search, setSearch] = useState("");
  const { list, loading } = useSelector((s) => s.courses);
  const dispatch = useDispatch();

  useEffect(() => {
    // typing ke beech har key par request na jaye, isliye thoda ruko
    const t = setTimeout(() => dispatch(fetchCourses({ search })), 300);
    return () => clearTimeout(t);
  }, [search, dispatch]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header & Search Bar */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Explore Courses
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Find the right course to build your skills
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, idx) => (
              <div
                key={idx}
                className="flex h-48 animate-pulse flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div>
                  <div className="h-5 w-20 rounded-md bg-gray-200" />
                  <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-gray-100" />
                </div>
                <div className="h-6 w-16 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && list.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">
              No courses found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search terms or check back later for new content.
            </p>
          </div>
        )}

        {/* Course Cards Grid */}
        {!loading && list.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((c) => (
              <Link
                key={c._id}
                to={`/courses/${c._id}`}
                className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div>
                  <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold tracking-wide text-blue-600">
                    {c.category || "General"}
                  </span>

                  <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600">
                    {c.title}
                  </h3>

                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-700">
                      {c.instructor?.name ? c.instructor.name.charAt(0).toUpperCase() : "I"}
                    </span>
                    {c.instructor?.name || "Instructor"}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span
                    className={`text-base font-bold ${
                      c.price === 0 ? "text-emerald-600" : "text-gray-900"
                    }`}
                  >
                    {c.price === 0 ? "Free" : `₹${c.price}`}
                  </span>

                  <span className="text-xs font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                    View details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}