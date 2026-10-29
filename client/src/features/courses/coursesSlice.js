import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchCourses = createAsyncThunk("courses/list", async (params = {}) => {
  const { data } = await api.get("/courses", { params });
  return data;
});

export const fetchCourse = createAsyncThunk("courses/one", async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
});

export const fetchMyEnrollments = createAsyncThunk("courses/enrollments", async () => {
  const { data } = await api.get("/enrollments/mine");
  return data;
});

const coursesSlice = createSlice({
  name: "courses",
  initialState: {
    list: [],
    total: 0,
    current: null, // { course, lessons }
    enrollments: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (s) => { s.loading = true; })
      .addCase(fetchCourses.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.courses;
        s.total = a.payload.total;
      })
      .addCase(fetchCourses.rejected, (s) => { s.loading = false; })
      .addCase(fetchCourse.pending, (s) => { s.current = null; })
      .addCase(fetchCourse.fulfilled, (s, a) => { s.current = a.payload; })
      .addCase(fetchMyEnrollments.fulfilled, (s, a) => { s.enrollments = a.payload; });
  },
});

export default coursesSlice.reducer;