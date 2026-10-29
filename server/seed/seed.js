import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Course from "../src/models/Course.js";
import Lesson from "../src/models/Lesson.js";
import Enrollment from "../src/models/Enrollment.js";

const catalog = [
  {
    title: "JavaScript from Zero",
    category: "Programming",
    price: 499,
    description: "Variables, functions, arrays and the DOM, explained step by step.",
    lessons: ["Setting up your editor", "Variables and types", "Functions", "Arrays and objects"],
  },
  {
    title: "React for Beginners",
    category: "Programming",
    price: 799,
    description: "Build real interfaces with components, props, state and hooks.",
    lessons: ["Why React", "Components and props", "State and events", "useEffect basics"],
  },
  {
    title: "Node.js and Express APIs",
    category: "Programming",
    price: 899,
    description: "Create REST APIs with authentication and MongoDB.",
    lessons: ["Node basics", "Express routing", "Connecting MongoDB", "JWT auth"],
  },
  {
    title: "UI Design Basics",
    category: "Design",
    price: 0,
    description: "Layout, colour and typography for people who are not designers.",
    lessons: ["Spacing and layout", "Choosing colours", "Typography"],
  },
  {
    title: "Digital Marketing 101",
    category: "Business",
    price: 599,
    description: "SEO, social media and email basics for small businesses.",
    lessons: ["How search works", "Social media plan", "Email campaigns"],
  },
  {
    title: "Data Analysis with Excel",
    category: "Data",
    price: 399,
    description: "Formulas, pivot tables and charts to make sense of messy data.",
    lessons: ["Cleaning data", "Formulas that matter", "Pivot tables", "Charts"],
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected, clearing old data...");

  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Lesson.deleteMany({}),
    Enrollment.deleteMany({}),
  ]);

  // create() use kar rahe hain taaki password hash wala hook chale
  const admin = await User.create({
    name: "Admin", email: "admin@lms.com", password: "admin123", role: "admin",
  });
  const teacherA = await User.create({
    name: "Rohit Sharma", email: "rohit@lms.com", password: "teacher123", role: "instructor",
  });
  const teacherB = await User.create({
    name: "Neha Verma", email: "neha@lms.com", password: "teacher123", role: "instructor",
  });
  const student = await User.create({
    name: "Aman Gupta", email: "aman@lms.com", password: "student123", role: "student",
  });

  const teachers = [teacherA, teacherB];

  for (let i = 0; i < catalog.length; i++) {
    const { lessons, ...data } = catalog[i];
    const course = await Course.create({
      ...data,
      instructor: teachers[i % 2]._id,
      status: "published",
      totalLessons: lessons.length,
    });
    await Lesson.insertMany(
      lessons.map((title, idx) => ({ course: course._id, title, order: idx + 1 }))
    );
  }

  console.log("Seed done.");
  console.log("Admin:      admin@lms.com / admin123");
  console.log("Instructor: rohit@lms.com / teacher123");
  console.log("Student:    aman@lms.com / student123");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});