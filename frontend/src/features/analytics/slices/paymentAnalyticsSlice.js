import { createSlice } from "@reduxjs/toolkit";

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
    setPaymentData: (state, action) => {
      state.overview.data = action.payload.overview;
      state.paymentMethods.data = action.payload.paymentMethods;
      state.refunds.data = action.payload.refunds;
      state.overview.status = "succeeded";
    },
    setPaymentLoading: (state) => {
      state.overview.status = "loading";
    },
  },
});

export const { setPaymentData, setPaymentLoading } = paymentAnalyticsSlice.actions;

export const selectPaymentOverview = (state) => state.paymentAnalytics.overview;
export const selectPaymentMethods = (state) => state.paymentAnalytics.paymentMethods;
export const selectRefunds = (state) => state.paymentAnalytics.refunds;

export default paymentAnalyticsSlice.reducer;
