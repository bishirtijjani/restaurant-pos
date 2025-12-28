import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../utils/offline/offlineAxios";

const API_URL = "/api/reports";

// Async Thunks
export const fetchReports = createAsyncThunk(
  "customReports/fetchReports",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reports"
      );
    }
  }
);

export const createReport = createAsyncThunk(
  "customReports/createReport",
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, reportData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create report"
      );
    }
  }
);

export const deleteReport = createAsyncThunk(
  "customReports/deleteReport",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete report"
      );
    }
  }
);

const initialState = {
  savedReports: {
    data: [],
    status: "idle",
    error: null,
  },
  reportBuilder: {
    selectedMetrics: [],
    selectedDimensions: [],
    filters: {},
    previewData: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
};

export const customReportsSlice = createSlice({
  name: "customReports",
  initialState,
  reducers: {
    updateBuilderState: (state, action) => {
      state.reportBuilder = { ...state.reportBuilder, ...action.payload };
    },
    resetBuilder: (state) => {
      state.reportBuilder = initialState.reportBuilder;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reports
      .addCase(fetchReports.pending, (state) => {
        state.savedReports.status = "loading";
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.savedReports.status = "succeeded";
        state.savedReports.data = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.savedReports.status = "failed";
        state.savedReports.error = action.payload;
      })
      // Create Report
      .addCase(createReport.pending, (state) => {
        state.reportBuilder.status = "loading";
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.reportBuilder.status = "succeeded";
        state.savedReports.data.unshift(action.payload); // Add to list immediately
      })
      .addCase(createReport.rejected, (state, action) => {
        state.reportBuilder.status = "failed";
        state.reportBuilder.error = action.payload;
      })
      // Delete Report
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.savedReports.data = state.savedReports.data.filter(
          (report) => report._id !== action.payload
        );
      });
  },
});

export const { setSavedReports, updateBuilderState, setReportLoading } =
  customReportsSlice.actions;

export const selectSavedReports = (state) => state.customReports.savedReports;
export const selectReportBuilder = (state) => state.customReports.reportBuilder;

export default customReportsSlice.reducer;
