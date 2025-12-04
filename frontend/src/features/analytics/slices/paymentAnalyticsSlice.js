import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchPaymentData = createAsyncThunk(
  "paymentAnalytics/fetchPaymentData",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/analytics/payments", {
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
    data: null, // { totalCollected, refunds, netRevenue, avgTransaction }
    status: "idle",
  },
  paymentMethods: {
    data: [], // { method, amount, count }
    status: "idle",
  },
  refunds: {
    data: [], // { date, amount, reason }
    status: "idle",
  },
};

export const paymentAnalyticsSlice = createSlice({
  name: "paymentAnalytics",
  initialState,
  reducers: {
    setPaymentLoading: (state) => {
      state.overview.status = "loading";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentData.pending, (state) => {
        state.overview.status = "loading";
        state.paymentMethods.status = "loading";
        state.refunds.status = "loading";
      })
      .addCase(fetchPaymentData.fulfilled, (state, action) => {
        state.overview.status = "succeeded";
        state.overview.data = action.payload.overview;
        state.paymentMethods.data = action.payload.paymentMethods;
        state.refunds.data = action.payload.refunds;
      })
      .addCase(fetchPaymentData.rejected, (state) => {
        state.overview.status = "failed";
      });
  },
});

export const { setPaymentData, setPaymentLoading } = paymentAnalyticsSlice.actions;

export const selectPaymentOverview = (state) => state.paymentAnalytics.overview;
export const selectPaymentMethods = (state) => state.paymentAnalytics.paymentMethods;
export const selectRefunds = (state) => state.paymentAnalytics.refunds;

export default paymentAnalyticsSlice.reducer;
