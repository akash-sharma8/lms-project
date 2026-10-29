import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Learn from "./pages/Learn";
import MyLearning from "./pages/MyLearning";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Courses />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route
          path="/learn/:courseId/:lessonId"
          element={<ProtectedRoute><Learn /></ProtectedRoute>}
        />
        <Route
          path="/my-learning"
          element={<ProtectedRoute roles={["student"]}><MyLearning /></ProtectedRoute>}
        />
      </Routes>
    </>
  );
}