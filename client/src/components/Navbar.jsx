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

  return (
    <nav style={{ display: "flex", gap: 16, padding: "12px 24px", borderBottom: "1px solid #ddd" }}>
      <Link to="/"><b>LMS</b></Link>
      {user && <Link to="/my-learning">My Learning</Link>}
      <span style={{ marginLeft: "auto" }} />
      {user ? (
        <>
          <span>{user.name} ({user.role})</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}