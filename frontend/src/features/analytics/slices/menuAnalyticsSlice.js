import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMenuData = createAsyncThunk(
  "menuAnalytics/fetchMenuData",
  async ({ startDate, endDate, branchId }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/analytics/menu", {
        params: { startDate, endDate, branchId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  matrix: {
    data: [], // { name, popularity (x), profitability (y), category }
    status: "idle",
  },
  categoryPerformance: {
    data: [], // { category, revenue, profit, itemsSold }
    status: "idle",
  },
  topPerformers: {
    data: [], // { name, profit, sold }
    status: "idle",
  },
  underPerformers: {
    data: [],
    status: "idle",
  },
};

export const menuAnalyticsSlice = createSlice({
  name: "menuAnalytics",
  initialState,
  reducers: {
    setMenuLoading: (state) => {
      state.matrix.status = "loading";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuData.pending, (state) => {
        state.matrix.status = "loading";
        state.categoryPerformance.status = "loading";
        state.topPerformers.status = "loading";
        state.underPerformers.status = "loading";
      })
      .addCase(fetchMenuData.fulfilled, (state, action) => {
        state.matrix.status = "succeeded";
        state.matrix.data = action.payload.matrix;
        state.categoryPerformance.data = action.payload.categoryPerformance;
        state.topPerformers.data = action.payload.topPerformers;
        state.underPerformers.data = action.payload.underPerformers;
      })
      .addCase(fetchMenuData.rejected, (state) => {
        state.matrix.status = "failed";
      });
  },
});

export const { setMenuData, setMenuLoading } = menuAnalyticsSlice.actions;

export const selectMenuMatrix = (state) => state.menuAnalytics.matrix;
export const selectCategoryPerformance = (state) => state.menuAnalytics.categoryPerformance;
export const selectTopPerformers = (state) => state.menuAnalytics.topPerformers;
export const selectUnderPerformers = (state) => state.menuAnalytics.underPerformers;

export default menuAnalyticsSlice.reducer;
