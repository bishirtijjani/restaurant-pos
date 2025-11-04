import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/onboarding";

// Fetch user's onboarding progress
export const fetchOnboardingProgress = createAsyncThunk(
  "onboarding/fetchProgress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/progress`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update step progress
export const updateStepProgress = createAsyncThunk(
  "onboarding/updateStep",
  async ({ tourId, stepId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/step`, { tourId, stepId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Complete tour
export const completeTour = createAsyncThunk(
  "onboarding/completeTour",
  async (tourId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/complete`, { tourId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Skip tour
export const skipTour = createAsyncThunk(
  "onboarding/skipTour",
  async (tourId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/skip`, { tourId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  progress: null,
  currentTour: null,
  activeTourId: null,
  isRunning: false,
  stepIndex: 0,
  loading: false,
  error: null,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    startTour: (state, action) => {
      state.activeTourId = action.payload;
      state.isRunning = true;
      state.stepIndex = 0;
    },
    stopTour: (state) => {
      state.activeTourId = null;
      state.isRunning = false;
      state.stepIndex = 0;
    },
    setStepIndex: (state, action) => {
      state.stepIndex = action.payload;
    },
    setCurrentTour: (state, action) => {
      state.currentTour = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch progress
      .addCase(fetchOnboardingProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnboardingProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.progress = action.payload;
      })
      .addCase(fetchOnboardingProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update step
      .addCase(updateStepProgress.fulfilled, (state, action) => {
        state.progress = action.payload;
      })

      // Complete tour
      .addCase(completeTour.fulfilled, (state, action) => {
        state.progress = action.payload;
        state.isRunning = false;
        state.activeTourId = null;
      })

      // Skip tour
      .addCase(skipTour.fulfilled, (state, action) => {
        state.progress = action.payload;
        state.isRunning = false;
        state.activeTourId = null;
      });
  },
});

export const { startTour, stopTour, setStepIndex, setCurrentTour } =
  onboardingSlice.actions;

export default onboardingSlice.reducer;
