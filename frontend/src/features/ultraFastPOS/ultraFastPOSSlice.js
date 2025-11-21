// frontend/src/features/ultraFastPOS/ultraFastPOSSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  keyboardSettings: null,
  loading: false,
  error: null,
};

export const fetchKeyboardSettings = createAsyncThunk(
  "ultraFastPOS/fetchKeyboardSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/ultra-fast-pos/keyboard-settings");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateKeyboardSettings = createAsyncThunk(
  "ultraFastPOS/updateKeyboardSettings",
  async (settings, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        "/api/ultra-fast-pos/keyboard-settings",
        {
          settings,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resetKeyboardSettings = createAsyncThunk(
  "ultraFastPOS/resetKeyboardSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/ultra-fast-pos/keyboard-settings/reset"
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const ultraFastPOSSlice = createSlice({
  name: "ultraFastPOS",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKeyboardSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKeyboardSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.keyboardSettings = action.payload;
      })
      .addCase(fetchKeyboardSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateKeyboardSettings.fulfilled, (state, action) => {
        state.keyboardSettings = action.payload;
      })
      .addCase(resetKeyboardSettings.fulfilled, (state, action) => {
        state.keyboardSettings = action.payload;
      });
  },
});

export default ultraFastPOSSlice.reducer;
