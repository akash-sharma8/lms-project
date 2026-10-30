import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../api/axios";

const rupee = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function Card({ label, value }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14, minWidth: 150 }}>
      <small style={{ color: "#666" }}>{label}</small>
      <div style={{ fontSize: 24, fontWeight: "bold" }}>{value}</div>
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
      .catch((err) => setError(err.response?.data?.message || "Could not load earnings"));
  }, []);

  if (error) return <p style={{ padding: 24, color: "crimson" }}>{error}</p>;
  if (!data) return <p style={{ padding: 24 }}>Loading...</p>;

  const { totals, byCourse, monthly, recent, feePercent } = data;

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <Link to="/instructor">← My courses</Link>
      <h2>Earnings</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Card label="Your earnings" value={rupee(totals.earned)} />
        <Card label="Total sales" value={totals.sales} />
        <Card label="Gross revenue" value={rupee(totals.gross)} />
        <Card label={`Platform fee (${feePercent}%)`} value={rupee(totals.fee)} />
      </div>

      <h3>Last 6 months</h3>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => rupee(v)} />
            <Bar dataKey="earned" name="Earned" fill="#4caf50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3>By course</h3>
      {byCourse.length === 0 && <p>No sales yet.</p>}
      {byCourse.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              <th>Course</th><th>Sales</th><th>Earned</th>
            </tr>
          </thead>
          <tbody>
            {byCourse.map((c) => (
              <tr key={c._id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{c.title}</td><td>{c.sales}</td><td>{rupee(c.earned)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Recent sales</h3>
      {recent.length === 0 && <p>Nothing yet.</p>}
      <ul>
        {recent.map((r) => (
          <li key={r._id}>
            {r.student} bought <b>{r.course}</b> for {rupee(r.amount)} (you got {rupee(r.earned)}) ·{" "}
            <small>{new Date(r.paidAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}