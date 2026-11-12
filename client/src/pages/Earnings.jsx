import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../api/axios";

const rupee = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        highlight
          ? "border-blue-200 bg-blue-50/40"
          : "border-gray-200 bg-white"
      }`}
    >
      <span className="block text-xs font-medium text-gray-500">{label}</span>
      <div
        className={`mt-2 text-2xl font-bold tracking-tight ${
          highlight ? "text-blue-600" : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function Earnings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/payments/earnings")
      .then(({ data }) => setData(data))
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load earnings")
      );
  }, []);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-7 w-44 rounded-lg bg-gray-200" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="h-24 rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="h-3.5 w-24 rounded bg-gray-200" />
                <div className="mt-3 h-7 w-28 rounded bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="h-80 rounded-2xl border border-gray-200 bg-white p-6" />
        </div>
      </div>
    );
  }

  const { totals, byCourse, monthly, recent, feePercent } = data;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Top Navigation & Heading */}
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Earnings & Revenue
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your payouts, course performance, and recent transactions
          </p>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Your net earnings"
            value={rupee(totals.earned)}
            highlight
          />
          <StatCard label="Total sales" value={totals.sales} />
          <StatCard label="Gross revenue" value={rupee(totals.gross)} />
          <StatCard
            label={`Platform fee (${feePercent}%)`}
            value={rupee(totals.fee)}
          />
        </div>

        {/* Monthly Revenue Chart Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Last 6 months
              </h2>
              <p className="text-xs text-gray-500">
                Monthly net payout breakdown
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              INR (₹)
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart
                data={monthly}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  formatter={(v) => [rupee(v), "Earned"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    fontSize: "13px",
                  }}
                />
                <Bar
                  dataKey="earned"
                  name="Earned"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom 2-Column Split: Course Breakdown & Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Earnings By Course Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-7">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-bold text-gray-900">
                Earnings by course
              </h2>
            </div>

            {byCourse.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                No course sales recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-3.5">Course</th>
                      <th className="px-4 py-3.5 text-right">Sales</th>
                      <th className="px-6 py-3.5 text-right">Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {byCourse.map((c) => (
                      <tr
                        key={c._id}
                        className="transition-colors hover:bg-gray-50/70"
                      >
                        <td className="px-6 py-3.5 font-medium text-gray-900">
                          {c.title}
                        </td>
                        <td className="px-4 py-3.5 text-right text-gray-600">
                          {c.sales}
                        </td>
                        <td className="px-6 py-3.5 text-right font-semibold text-gray-900">
                          {rupee(c.earned)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Sales Feed */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-5">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-bold text-gray-900">
                Recent sales
              </h2>
            </div>

            {recent.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                No recent transactions yet.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recent.map((r) => (
                  <li
                    key={r._id}
                    className="flex items-start justify-between gap-3 px-6 py-4 transition-colors hover:bg-gray-50/70"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {r.student}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {r.course}
                      </p>
                      <span className="mt-1 block text-[11px] text-gray-400">
                        {new Date(r.paidAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        +{rupee(r.earned)}
                      </span>
                      <span className="mt-1 block text-[11px] text-gray-400">
                        of {rupee(r.amount)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}