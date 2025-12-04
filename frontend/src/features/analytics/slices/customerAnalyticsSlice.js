import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  overview: {
    data: null, // { totalCustomers, newCustomers, repeatRate, avgLTV }
    status: "idle",
  },
  retention: {
    data: [], // { month, retentionRate }
    status: "idle",
  },
  segmentation: {
    data: [], // { segment, count }
    status: "idle",
  },
  topCustomers: {
    data: [], // { id, name, visits, totalSpent, lastVisit }
    status: "idle",
  },
};

export const customerAnalyticsSlice = createSlice({
  name: "customerAnalytics",
  initialState,
  reducers: {
    setCustomerData: (state, action) => {
      state.overview.data = action.payload.overview;
      state.retention.data = action.payload.retention;
      state.segmentation.data = action.payload.segmentation;
      state.topCustomers.data = action.payload.topCustomers;
      state.overview.status = "succeeded";
    },
    setCustomerLoading: (state) => {
      state.overview.status = "loading";
    },
  },
});

export const { setCustomerData, setCustomerLoading } = customerAnalyticsSlice.actions;

export const selectCustomerOverview = (state) => state.customerAnalytics.overview;
export const selectCustomerRetention = (state) => state.customerAnalytics.retention;
export const selectCustomerSegmentation = (state) => state.customerAnalytics.segmentation;
export const selectTopCustomers = (state) => state.customerAnalytics.topCustomers;

export default customerAnalyticsSlice.reducer;
