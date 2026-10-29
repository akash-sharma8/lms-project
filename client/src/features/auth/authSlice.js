import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const saved = localStorage.getItem("user");

export const login = createAsyncThunk("auth/login", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

function saveSession(state, { token, user }) {
  state.user = user;
  state.loading = false;
  state.error = null;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: saved ? JSON.parse(saved) : null,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    for (const thunk of [login, register]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => saveSession(state, action.payload))
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    }
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;