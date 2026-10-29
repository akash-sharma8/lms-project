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
    <div style={{ padding: 24 }}>
      <input
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: 8, width: 280 }}
      />
      {loading && <p>Loading...</p>}
      {!loading && list.length === 0 && <p>No courses found.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginTop: 16 }}>
        {list.map((c) => (
          <Link key={c._id} to={`/courses/${c._id}`} style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, textDecoration: "none", color: "inherit" }}>
            <small>{c.category}</small>
            <h3 style={{ margin: "6px 0" }}>{c.title}</h3>
            <p style={{ margin: 0 }}>by {c.instructor?.name}</p>
            <b>{c.price === 0 ? "Free" : `₹${c.price}`}</b>
          </Link>
        ))}
      </div>
    </div>
  );
}