import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCustomerData = createAsyncThunk(
  "customerAnalytics/fetchCustomerData",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/analytics/customers", {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

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
    setCustomerLoading: (state) => {
      state.overview.status = "loading";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerData.pending, (state) => {
        state.overview.status = "loading";
        state.retention.status = "loading";
        state.segmentation.status = "loading";
        state.topCustomers.status = "loading";
      })
      .addCase(fetchCustomerData.fulfilled, (state, action) => {
        state.overview.status = "succeeded";
        state.overview.data = action.payload.overview;
        state.retention.data = action.payload.retention;
        state.segmentation.data = action.payload.segmentation;
        state.topCustomers.data = action.payload.topCustomers;
      })
      .addCase(fetchCustomerData.rejected, (state) => {
        state.overview.status = "failed";
      });
  },
});

export const { setCustomerData, setCustomerLoading } = customerAnalyticsSlice.actions;

export const selectCustomerOverview = (state) => state.customerAnalytics.overview;
export const selectCustomerRetention = (state) => state.customerAnalytics.retention;
export const selectCustomerSegmentation = (state) => state.customerAnalytics.segmentation;
export const selectTopCustomers = (state) => state.customerAnalytics.topCustomers;

export default customerAnalyticsSlice.reducer;
