import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { startOfMonth, endOfDay, subDays } from "date-fns";
import axios from "axios";

export const fetchOverviewData = createAsyncThunk(
  "analyticsGlobal/fetchOverviewData",
  async ({ startDate, endDate, branchId }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/analytics/overview", {
        params: { startDate, endDate, branchId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  dateRange: {
    startDate: subDays(new Date(), 30).toISOString(),
    endDate: endOfDay(new Date()).toISOString(),
    label: "Last 30 Days",
  },
  globalFilters: {
    branchId: null, // null = All Branches
  },
  overview: {
    kpis: null,
    hourlyTrend: [],
    recentActivity: [],
    status: "idle",
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverviewData.pending, (state) => {
        state.overview.status = "loading";
      })
      .addCase(fetchOverviewData.fulfilled, (state, action) => {
        state.overview.status = "succeeded";
        state.overview.kpis = action.payload.kpis;
        state.overview.hourlyTrend = action.payload.hourlyTrend;
        state.overview.recentActivity = action.payload.recentActivity;
      })
      .addCase(fetchOverviewData.rejected, (state) => {
        state.overview.status = "failed";
      });
  },
});

export const { setDateRange, setGlobalFilter, resetGlobalFilters, setLoading } =
  analyticsGlobalSlice.actions;

export const selectDateRange = (state) => state.analyticsGlobal.dateRange;
export const selectGlobalFilters = (state) => state.analyticsGlobal.globalFilters;
export const selectAnalyticsLoading = (state) => state.analyticsGlobal.ui.isLoading;
export const selectOverviewData = (state) => state.analyticsGlobal.overview;

export default analyticsGlobalSlice.reducer;
