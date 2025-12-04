import { createSlice } from "@reduxjs/toolkit";

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
    setAdvancedData: (state, action) => {
      state.heatmap.data = action.payload.heatmap;
      state.forecasting.data = action.payload.forecasting;
      state.anomalyDetection.data = action.payload.anomalyDetection;
      state.heatmap.status = "succeeded";
    },
    setAdvancedLoading: (state) => {
      state.heatmap.status = "loading";
    },
  },
});

export const { setAdvancedData, setAdvancedLoading } = advancedAnalyticsSlice.actions;

export const selectHeatmapData = (state) => state.advancedAnalytics.heatmap;
export const selectForecastingData = (state) => state.advancedAnalytics.forecasting;
export const selectAnomalies = (state) => state.advancedAnalytics.anomalyDetection;

export default advancedAnalyticsSlice.reducer;
