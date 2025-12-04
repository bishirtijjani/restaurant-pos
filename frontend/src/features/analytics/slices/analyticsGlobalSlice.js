import { createSlice } from "@reduxjs/toolkit";
import { startOfMonth, endOfDay, subDays } from "date-fns";

const initialState = {
  dateRange: {
    startDate: subDays(new Date(), 30).toISOString(),
    endDate: endOfDay(new Date()).toISOString(),
    label: "Last 30 Days",
  },
  globalFilters: {
    branchId: null, // null = All Branches
  },
  ui: {
    isSidebarCollapsed: false,
    isLoading: false,
  },
};

export const analyticsGlobalSlice = createSlice({
  name: "analyticsGlobal",
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    setGlobalFilter: (state, action) => {
      const { key, value } = action.payload;
      state.globalFilters[key] = value;
    },
    resetGlobalFilters: (state) => {
      state.globalFilters = initialState.globalFilters;
    },
    setLoading: (state, action) => {
      state.ui.isLoading = action.payload;
    },
  },
});

export const { setDateRange, setGlobalFilter, resetGlobalFilters, setLoading } =
  analyticsGlobalSlice.actions;

export const selectDateRange = (state) => state.analyticsGlobal.dateRange;
export const selectGlobalFilters = (state) => state.analyticsGlobal.globalFilters;
export const selectAnalyticsLoading = (state) => state.analyticsGlobal.ui.isLoading;

export default analyticsGlobalSlice.reducer;
