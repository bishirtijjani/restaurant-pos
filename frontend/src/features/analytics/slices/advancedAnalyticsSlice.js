import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../utils/offline/offlineAxios";

export const fetchAdvancedData = createAsyncThunk(
  "advancedAnalytics/fetchAdvancedData",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/analytics/advanced", {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  heatmap: {
    data: [], // Array of { day, hour, value }
    status: "idle",
  },
  forecasting: {
    data: [], // Array of { date, actual, predicted }
    status: "idle",
  },
  anomalyDetection: {
    data: [], // Array of anomalies
    status: "idle",
  },
};

export const advancedAnalyticsSlice = createSlice({
  name: "advancedAnalytics",
  initialState,
  reducers: {
    setAdvancedLoading: (state) => {
      state.heatmap.status = "loading";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdvancedData.pending, (state) => {
        state.heatmap.status = "loading";
        state.forecasting.status = "loading";
        state.anomalyDetection.status = "loading";
      })
      .addCase(fetchAdvancedData.fulfilled, (state, action) => {
        state.heatmap.status = "succeeded";
        state.heatmap.data = action.payload.heatmap;
        state.forecasting.data = action.payload.forecasting;
        // Store rule-based insights if provided
        state.forecasting.insights = action.payload.insights || [];
        state.anomalyDetection.data = action.payload.anomalyDetection;
      })
      .addCase(fetchAdvancedData.rejected, (state) => {
        state.heatmap.status = "failed";
      });
  },
});

export const { setAdvancedData, setAdvancedLoading } =
  advancedAnalyticsSlice.actions;

export const selectHeatmapData = (state) => state.advancedAnalytics.heatmap;
export const selectForecastingData = (state) =>
  state.advancedAnalytics.forecasting;
export const selectAnomalies = (state) =>
  state.advancedAnalytics.anomalyDetection;

export default advancedAnalyticsSlice.reducer;
