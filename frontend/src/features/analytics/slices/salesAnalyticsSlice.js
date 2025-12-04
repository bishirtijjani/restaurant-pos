import { createSlice } from "@reduxjs/toolkit";

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
    data: [], // Array of { type, value }
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
    // specific actions if needed, otherwise async thunks will handle state
    setSalesData: (state, action) => {
      state.overview.data = action.payload.overview;
      state.trends.data = action.payload.trends;
      state.byOrderType.data = action.payload.byOrderType;
      state.topItems.data = action.payload.topItems;
      state.overview.status = "succeeded";
    },
    setSalesLoading: (state) => {
      state.overview.status = "loading";
    },
  },
});

export const { setSalesData, setSalesLoading } = salesAnalyticsSlice.actions;

export const selectSalesOverview = (state) => state.salesAnalytics.overview;
export const selectSalesTrends = (state) => state.salesAnalytics.trends;
export const selectSalesByOrderType = (state) => state.salesAnalytics.byOrderType;
export const selectTopSellingItems = (state) => state.salesAnalytics.topItems;

export default salesAnalyticsSlice.reducer;
