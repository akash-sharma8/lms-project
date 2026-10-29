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
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "60px auto", display: "grid", gap: 10 }}>
      <h2>Create account</h2>
      <input name="name" placeholder="Name" value={form.name} onChange={change} required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
      <input name="password" type="password" placeholder="Password (min 6)" value={form.password} onChange={change} required minLength={6} />
      <select name="role" value={form.role} onChange={change}>
        <option value="student">I want to learn</option>
        <option value="instructor">I want to teach</option>
      </select>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <button disabled={loading}>{loading ? "Please wait..." : "Register"}</button>
      <small>Already registered? <Link to="/login">Login</Link></small>
    </form>
  );
}