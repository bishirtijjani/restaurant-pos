import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../utils/offline/offlineAxios";

export const fetchSalesData = createAsyncThunk(
  "salesAnalytics/fetchSalesData",
  async ({ startDate, endDate, branchId }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/analytics/sales", {
        params: { startDate, endDate, branchId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  overview: {
    data: null, // { totalRevenue, totalOrders, avgOrderValue, netProfit }
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  trends: {
    data: [], // Array of { date, revenue, orders }
    status: "idle",
  },
  byOrderType: {
    data: [], // Array of { name, value }
    status: "idle",
  },
  topItems: {
    data: [], // Array of { name, quantity, revenue }
    status: "idle",
  },
};

export const salesAnalyticsSlice = createSlice({
  name: "salesAnalytics",
  initialState,
  reducers: {
    setSalesLoading: (state) => {
      state.overview.status = "loading";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesData.pending, (state) => {
        state.overview.status = "loading";
        state.trends.status = "loading";
        state.byOrderType.status = "loading";
        state.topItems.status = "loading";
      })
      .addCase(fetchSalesData.fulfilled, (state, action) => {
        state.overview.status = "succeeded";
        state.overview.data = action.payload.overview;
        state.trends.data = action.payload.trends;
        state.byOrderType.data = action.payload.byOrderType;
        state.topItems.data = action.payload.topItems;
      })
      .addCase(fetchSalesData.rejected, (state, action) => {
        state.overview.status = "failed";
        state.overview.error = action.payload;
      });
  },
});

export const { setSalesData, setSalesLoading } = salesAnalyticsSlice.actions;

export const selectSalesOverview = (state) => state.salesAnalytics.overview;
export const selectSalesTrends = (state) => state.salesAnalytics.trends;
export const selectSalesByOrderType = (state) =>
  state.salesAnalytics.byOrderType;
export const selectTopSellingItems = (state) => state.salesAnalytics.topItems;

export default salesAnalyticsSlice.reducer;
