// frontend/src/app/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { isTokenExpired } from "../utils/Helpers";

// Helper function to get user from token
const getUserFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (token && !isTokenExpired(token)) {
      // First check if we have the full user object persisted
      const persistedUser = localStorage.getItem("user");
      if (persistedUser) {
        return JSON.parse(persistedUser);
      }
      // Fallback to token decoding if no persisted user found
      const decoded = jwtDecode(token);
      return decoded;
    }
  } catch (error) {}
  return null;
};

// Initial state for authentication
const initialState = {
  token: localStorage.getItem("token") || null,
  user: getUserFromToken(), // Initialize user from token
  loading: false,
  error: null,
};

// Async thunk for logging in
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/auth/login", userCredentials);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (token) {
        axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
      }
      return { user, token };
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "Login failed, Try again later",
      );
    }
  },
);

// Async thunk for logging in with PIN
export const loginUserWithPin = createAsyncThunk(
  "auth/loginUserWithPin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/auth/pin-login", credentials);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (token) {
        axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
      }
      return { user, token };
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "PIN Login failed, Try again later",
      );
    }
  },
);

// Async thunk for registering a new user
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/auth/register", userCredentials);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return { token, user };
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

// Async thunk for logging out
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await axios.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout failed", error);
  }
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // Clear persisted user
  return null;
});

// Async thunk for refreshing session
export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/auth/refresh");
      const { token } = response.data;
      localStorage.setItem("token", token);
      // Determine user to save - merge with existing if needed
      // Note: Backend might not return full user on refresh, so be careful.
      // If backend only returns token, we rely on existing cache or calls to /me.
      // But typically refresh endpoint returns new token.
      // If we decode token here, it's still partial.
      // Ideally we should fetch /me after refresh if online, or keep existing local user.

      axios.defaults.headers.common["authorization"] = `Bearer ${token}`;

      // Decode user from token
      const user = jwtDecode(token);
      return { token, user };
    } catch (error) {
      localStorage.removeItem("token");
      return rejectWithValue("Session expired");
    }
  },
);

// Async thunk for getting current user
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");

      // If no token or expired, try to refresh first
      if (!token || isTokenExpired(token)) {
        try {
          const result = await dispatch(refreshSession()).unwrap();
          // If refresh successful, we have a valid token now
          // We can proceed to fetch user details if needed,
          // but refreshSession already returns the user from token.
          // However, to get full user details (like role permissions not in token),
          // we might still want to call /me.
          // For now, let's assume /me is what we want.
        } catch (refreshError) {
          // If refresh fails, we are truly logged out
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          return rejectWithValue("Session expired");
        }
      }

      // First try to get from token (works offline)
      const userFromToken = getUserFromToken();
      if (userFromToken) {
        // If offline, return the token data immediately
        if (!navigator.onLine) {
          return userFromToken;
        }

        // If online, try to fetch fresh data but fallback to token if it fails
        try {
          const response = await axios.get("/api/auth/me");
          return response.data.user;
        } catch (error) {
          // If fetch fails but we have token data, use that
          return userFromToken;
        }
      }

      // If no token data, must fetch from server
      const response = await axios.get("/api/auth/me");
      localStorage.setItem("user", JSON.stringify(response.data.user)); // Update local storage with fresh data
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user data",
      );
    }
  },
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token available");

      const response = await axios.put("/api/auth/me", formData);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  },
);

// Create the auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Add a reducer to manually set user from token
    setUserFromToken: (state) => {
      const user = getUserFromToken();
      if (user) {
        state.user = user;
      }
    },
    // Add a reducer to clear auth errors
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle registration
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle PIN login
      .addCase(loginUserWithPin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserWithPin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUserWithPin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle refreshSession
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.token = action.payload.token;
        // We might want to merge with existing user data or just update basic info
        state.user = { ...state.user, ...action.payload.user };
      })
      .addCase(refreshSession.rejected, (state) => {
        state.token = null;
        state.user = null;
      })
      // Handle getCurrentUser
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If getCurrentUser fails but we have a token, try to use token data
        const userFromToken = getUserFromToken();
        if (userFromToken) {
          state.user = userFromToken;
        }
      })
      // Handle logout
      .addCase(logoutUser.pending, (state) => {
        state.token = null;
        state.user = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.token = null;
        state.user = null;
      })
      // Handle profile update
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUserFromToken, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
