import jwt from "jsonwebtoken";
import User from "../models/User.js";

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export async function register(req, res) {
  const { name, email, password, role } = req.body;

  // nobody can self-register as admin
  const safeRole = role === "instructor" ? "instructor" : "student";

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already used" });

  const user = await User.create({ name, email, password, role: safeRole });
  res.status(201).json({
    token: makeToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Wrong email or password" });
  }
  res.json({
    token: makeToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export const me = (req, res) => res.json({ user: req.user });