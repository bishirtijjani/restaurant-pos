import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper function for API calls
const makeApiCall = async (endpoint, params, thunkAPI) => {
  try {
    const response = await axios.get(`/api/analytics${endpoint}`, { params });
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "An error occurred"
    );
  }
};

// Async thunks
export const fetchOverviewStats = createAsyncThunk(
  "analytics/fetchOverviewStats",
  async (params, thunkAPI) => {
    return makeApiCall("/overview", params, thunkAPI);
  }
);

export const fetchSalesTrends = createAsyncThunk(
  "analytics/fetchSalesTrends",
  async (params, thunkAPI) => {
    return makeApiCall("/sales-trends", params, thunkAPI);
  }
);

export const fetchSalesByCategory = createAsyncThunk(
  "analytics/fetchSalesByCategory",
  async (params, thunkAPI) => {
    return makeApiCall("/sales-by-category", params, thunkAPI);
  }
);

export const fetchMenuItemPerformance = createAsyncThunk(
  "analytics/fetchMenuItemPerformance",
  async (params, thunkAPI) => {
    return makeApiCall("/menu-item-performance", params, thunkAPI);
  }
);

export const fetchPeakHoursAnalysis = createAsyncThunk(
  "analytics/fetchPeakHoursAnalysis",
  async (params, thunkAPI) => {
    return makeApiCall("/peak-hours", params, thunkAPI);
  }
);

export const fetchExpenseAnalysis = createAsyncThunk(
  "analytics/fetchExpenseAnalysis",
  async (params, thunkAPI) => {
    return makeApiCall("/expense-analysis", params, thunkAPI);
  }
);

export const fetchStaffPerformance = createAsyncThunk(
  "analytics/fetchStaffPerformance",
  async (params, thunkAPI) => {
    return makeApiCall("/staff-performance", params, thunkAPI);
  }
);

export const fetchProfitabilityReport = createAsyncThunk(
  "analytics/fetchProfitabilityReport",
  async (params, thunkAPI) => {
    return makeApiCall("/profitability", params, thunkAPI);
  }
);

export const exportAnalyticsData = createAsyncThunk(
  "analytics/exportData",
  async (params, thunkAPI) => {
    return makeApiCall("/export", params, thunkAPI);
  }
);

// Initial state
const initialState = {
  overviewStats: {
    data: null,
    loading: false,
    error: null,
  },
  salesTrends: {
    data: null,
    loading: false,
    error: null,
  },
  salesByCategory: {
    data: null,
    loading: false,
    error: null,
  },
  menuItemPerformance: {
    data: null,
    loading: false,
    error: null,
  },
  peakHoursAnalysis: {
    data: null,
    loading: false,
    error: null,
  },
  expenseAnalysis: {
    data: null,
    loading: false,
    error: null,
  },
  staffPerformance: {
    data: null,
    loading: false,
    error: null,
  },
  profitabilityReport: {
    data: null,
    loading: false,
    error: null,
  },
  exportedData: {
    data: null,
    loading: false,
    error: null,
  },
  dateRange: {
    startDate: new Date(
      new Date().setDate(new Date().getDate() - 30)
    ).toISOString(),
    endDate: new Date().toISOString(),
  },
  selectedRange: "month", // today, week, month, year, custom
};

// Create slice
const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = {
        startDate:
          action.payload.startDate instanceof Date
            ? action.payload.startDate.toISOString()
            : action.payload.startDate,
        endDate:
          action.payload.endDate instanceof Date
            ? action.payload.endDate.toISOString()
            : action.payload.endDate,
      };
    },
    setSelectedRange: (state, action) => {
      state.selectedRange = action.payload;
    },
    clearExportedData: (state) => {
      state.exportedData.data = null;
    },
  },
  extraReducers: (builder) => {
    // Overview Stats
    builder
      .addCase(fetchOverviewStats.pending, (state) => {
        state.overviewStats.loading = true;
        state.overviewStats.error = null;
      })
      .addCase(fetchOverviewStats.fulfilled, (state, action) => {
        state.overviewStats.loading = false;
        state.overviewStats.data = action.payload;
      })
      .addCase(fetchOverviewStats.rejected, (state, action) => {
        state.overviewStats.loading = false;
        state.overviewStats.error = action.payload;
      })

      // Sales Trends
      .addCase(fetchSalesTrends.pending, (state) => {
        state.salesTrends.loading = true;
        state.salesTrends.error = null;
      })
      .addCase(fetchSalesTrends.fulfilled, (state, action) => {
        state.salesTrends.loading = false;
        state.salesTrends.data = action.payload;
      })
      .addCase(fetchSalesTrends.rejected, (state, action) => {
        state.salesTrends.loading = false;
        state.salesTrends.error = action.payload;
      })

      // Sales By Category
      .addCase(fetchSalesByCategory.pending, (state) => {
        state.salesByCategory.loading = true;
        state.salesByCategory.error = null;
      })
      .addCase(fetchSalesByCategory.fulfilled, (state, action) => {
        state.salesByCategory.loading = false;
        state.salesByCategory.data = action.payload;
      })
      .addCase(fetchSalesByCategory.rejected, (state, action) => {
        state.salesByCategory.loading = false;
        state.salesByCategory.error = action.payload;
      })

      // Menu Item Performance
      .addCase(fetchMenuItemPerformance.pending, (state) => {
        state.menuItemPerformance.loading = true;
        state.menuItemPerformance.error = null;
      })
      .addCase(fetchMenuItemPerformance.fulfilled, (state, action) => {
        state.menuItemPerformance.loading = false;
        state.menuItemPerformance.data = action.payload;
      })
      .addCase(fetchMenuItemPerformance.rejected, (state, action) => {
        state.menuItemPerformance.loading = false;
        state.menuItemPerformance.error = action.payload;
      })

      // Peak Hours Analysis
      .addCase(fetchPeakHoursAnalysis.pending, (state) => {
        state.peakHoursAnalysis.loading = true;
        state.peakHoursAnalysis.error = null;
      })
      .addCase(fetchPeakHoursAnalysis.fulfilled, (state, action) => {
        state.peakHoursAnalysis.loading = false;
        state.peakHoursAnalysis.data = action.payload;
      })
      .addCase(fetchPeakHoursAnalysis.rejected, (state, action) => {
        state.peakHoursAnalysis.loading = false;
        state.peakHoursAnalysis.error = action.payload;
      })

      // Expense Analysis
      .addCase(fetchExpenseAnalysis.pending, (state) => {
        state.expenseAnalysis.loading = true;
        state.expenseAnalysis.error = null;
      })
      .addCase(fetchExpenseAnalysis.fulfilled, (state, action) => {
        state.expenseAnalysis.loading = false;
        state.expenseAnalysis.data = action.payload;
      })
      .addCase(fetchExpenseAnalysis.rejected, (state, action) => {
        state.expenseAnalysis.loading = false;
        state.expenseAnalysis.error = action.payload;
      })

      // Staff Performance
      .addCase(fetchStaffPerformance.pending, (state) => {
        state.staffPerformance.loading = true;
        state.staffPerformance.error = null;
      })
      .addCase(fetchStaffPerformance.fulfilled, (state, action) => {
        state.staffPerformance.loading = false;
        state.staffPerformance.data = action.payload;
      })
      .addCase(fetchStaffPerformance.rejected, (state, action) => {
        state.staffPerformance.loading = false;
        state.staffPerformance.error = action.payload;
      })

      // Profitability Report
      .addCase(fetchProfitabilityReport.pending, (state) => {
        state.profitabilityReport.loading = true;
        state.profitabilityReport.error = null;
      })
      .addCase(fetchProfitabilityReport.fulfilled, (state, action) => {
        state.profitabilityReport.loading = false;
        state.profitabilityReport.data = action.payload;
      })
      .addCase(fetchProfitabilityReport.rejected, (state, action) => {
        state.profitabilityReport.loading = false;
        state.profitabilityReport.error = action.payload;
      })

      // Export Data
      .addCase(exportAnalyticsData.pending, (state) => {
        state.exportedData.loading = true;
        state.exportedData.error = null;
      })
      .addCase(exportAnalyticsData.fulfilled, (state, action) => {
        state.exportedData.loading = false;
        state.exportedData.data = action.payload;
      })
      .addCase(exportAnalyticsData.rejected, (state, action) => {
        state.exportedData.loading = false;
        state.exportedData.error = action.payload;
      });
  },
});

export const { setDateRange, setSelectedRange, clearExportedData } =
  analyticsSlice.actions;

// Selectors
export const selectOverviewStats = (state) => state.analytics.overviewStats;
export const selectSalesTrends = (state) => state.analytics.salesTrends;
export const selectSalesByCategory = (state) => state.analytics.salesByCategory;
export const selectMenuItemPerformance = (state) =>
  state.analytics.menuItemPerformance;
export const selectPeakHoursAnalysis = (state) =>
  state.analytics.peakHoursAnalysis;
export const selectExpenseAnalysis = (state) => state.analytics.expenseAnalysis;
export const selectStaffPerformance = (state) =>
  state.analytics.staffPerformance;
export const selectProfitabilityReport = (state) =>
  state.analytics.profitabilityReport;
export const selectExportedData = (state) => state.analytics.exportedData;
export const selectDateRange = (state) => state.analytics.dateRange;
export const selectSelectedRange = (state) => state.analytics.selectedRange;

export default analyticsSlice.reducer;
