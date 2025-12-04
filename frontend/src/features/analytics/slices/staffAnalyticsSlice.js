import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchStaffData = createAsyncThunk(
  "staffAnalytics/fetchStaffData",
  async ({ startDate, endDate, branchId }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/analytics/staff", {
        params: { startDate, endDate, branchId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  performance: {
    data: [], // { name, sales, orders, avgTime }
    status: "idle",
  },
  laborCost: {
    data: [], // { date, cost, sales, percentage }
    status: "idle",
  },
  staffList: {
    data: [],
    status: "idle",
  },
};

export const staffAnalyticsSlice = createSlice({
  name: "staffAnalytics",
  initialState,
  reducers: {
    setStaffLoading: (state) => {
      state.performance.status = "loading";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffData.pending, (state) => {
        state.performance.status = "loading";
        state.laborCost.status = "loading";
        state.staffList.status = "loading";
      })
      .addCase(fetchStaffData.fulfilled, (state, action) => {
        state.performance.status = "succeeded";
        state.performance.data = action.payload.performance;
        state.laborCost.data = action.payload.laborCost;
        state.staffList.data = action.payload.staffList;
      })
      .addCase(fetchStaffData.rejected, (state) => {
        state.performance.status = "failed";
      });
  },
});

export const { setStaffData, setStaffLoading } = staffAnalyticsSlice.actions;

export const selectStaffPerformance = (state) => state.staffAnalytics.performance;
export const selectLaborCost = (state) => state.staffAnalytics.laborCost;
export const selectStaffList = (state) => state.staffAnalytics.staffList;

export default staffAnalyticsSlice.reducer;
