import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Learn from "./pages/Learn";
import MyLearning from "./pages/MyLearning";
import Quiz from "./pages/Quiz";
import InstructorDashboard from "./pages/InstructorDashboard";
import ManageCourse from "./pages/ManageCourse";
import QuizBuilder from "./pages/QuizBuilder";


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
        <Route
          path="/quiz/:quizId"
          element={<ProtectedRoute><Quiz /></ProtectedRoute>}
        />
        <Route
          path="/instructor"
          element={<ProtectedRoute roles={["instructor", "admin"]}><InstructorDashboard /></ProtectedRoute>}
        />
        <Route
          path="/instructor/courses/:id"
          element={<ProtectedRoute roles={["instructor", "admin"]}><ManageCourse /></ProtectedRoute>}
        />
        <Route
          path="/instructor/courses/:id/quiz/new"
          element={<ProtectedRoute roles={["instructor", "admin"]}><QuizBuilder /></ProtectedRoute>}
        />

      </Routes>
    </>
  );
}