import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../utils/offline/offlineAxios";

export const fetchTaxData = createAsyncThunk(
  "taxAnalytics/fetchTaxData",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/analytics/tax", {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  overview: {
    data: null, // { totalGross, totalTax, totalServiceCharge, totalNet, orderCount }
    status: "idle",
    error: null,
  },
  breakdown: {
    data: [], // Array of { rate, amount, name }
    status: "idle",
  },
  trends: {
    data: [], // Array of { date, tax, serviceCharge, revenue }
    status: "idle",
  },
};

export const taxAnalyticsSlice = createSlice({
  name: "taxAnalytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaxData.pending, (state) => {
        state.overview.status = "loading";
        state.breakdown.status = "loading";
        state.trends.status = "loading";
      })
      .addCase(fetchTaxData.fulfilled, (state, action) => {
        state.overview.status = "succeeded";
        state.overview.data = action.payload.overview;
        state.breakdown.status = "succeeded";
        state.breakdown.data = action.payload.breakdown;
        state.trends.status = "succeeded";
        state.trends.data = action.payload.trends;
      })
      .addCase(fetchTaxData.rejected, (state, action) => {
        state.overview.status = "failed";
        state.overview.error = action.payload;
        state.breakdown.status = "failed";
        state.trends.status = "failed";
      });
  },
});

export const selectTaxOverview = (state) => state.taxAnalytics.overview;
export const selectTaxBreakdown = (state) => state.taxAnalytics.breakdown;
export const selectTaxTrends = (state) => state.taxAnalytics.trends;

export default taxAnalyticsSlice.reducer;
