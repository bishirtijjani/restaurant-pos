import { createSlice } from "@reduxjs/toolkit";

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
    setMenuData: (state, action) => {
      state.matrix.data = action.payload.matrix;
      state.categoryPerformance.data = action.payload.categoryPerformance;
      state.topPerformers.data = action.payload.topPerformers;
      state.underPerformers.data = action.payload.underPerformers;
      state.matrix.status = "succeeded";
    },
    setMenuLoading: (state) => {
      state.matrix.status = "loading";
    },
  },
});

export const { setMenuData, setMenuLoading } = menuAnalyticsSlice.actions;

export const selectMenuMatrix = (state) => state.menuAnalytics.matrix;
export const selectCategoryPerformance = (state) => state.menuAnalytics.categoryPerformance;
export const selectTopPerformers = (state) => state.menuAnalytics.topPerformers;
export const selectUnderPerformers = (state) => state.menuAnalytics.underPerformers;

export default menuAnalyticsSlice.reducer;
