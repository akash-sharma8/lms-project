import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import coursesReducer from "../features/courses/coursesSlice";
import instructorReducer from "../features/instructor/instructorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    instructor: instructorReducer,
  },
});