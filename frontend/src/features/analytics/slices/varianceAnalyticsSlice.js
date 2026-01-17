import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../utils/offline/offlineAxios";

export const fetchVarianceData = createAsyncThunk(
  "varianceAnalytics/fetchVarianceData",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/analytics/inventory/variance", {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  summary: {
    totalAdjustments: 0,
    totalLoss: 0,
    totalGain: 0,
    netImpact: 0,
  },
  items: [],
  reasons: [],
  details: [],
  status: "idle",
  error: null,
};

const varianceAnalyticsSlice = createSlice({
  name: "varianceAnalytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVarianceData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchVarianceData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.summary = action.payload.summary;
        state.items = action.payload.items;
        state.reasons = action.payload.reasons;
        state.details = action.payload.details;
      })
      .addCase(fetchVarianceData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default varianceAnalyticsSlice.reducer;
