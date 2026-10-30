import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchMyCourses = createAsyncThunk("instructor/mine", async () => {
  const { data } = await api.get("/courses/mine");
  return data;
});

const instructorSlice = createSlice({
  name: "instructor",
  initialState: { courses: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyCourses.pending, (s) => { s.loading = true; })
      .addCase(fetchMyCourses.fulfilled, (s, a) => {
        s.loading = false;
        s.courses = a.payload;
      })
      .addCase(fetchMyCourses.rejected, (s) => { s.loading = false; });
  },
});

export default instructorSlice.reducer;