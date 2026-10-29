import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../features/auth/authSlice";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { loading, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) navigate("/");
  }

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "60px auto", display: "grid", gap: 10 }}>
      <h2>Login</h2>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={change} required />
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <button disabled={loading}>{loading ? "Please wait..." : "Login"}</button>
      <small>Demo: aman@lms.com / student123</small>
      <small>No account? <Link to="/register">Register</Link></small>
    </form>
  );
}