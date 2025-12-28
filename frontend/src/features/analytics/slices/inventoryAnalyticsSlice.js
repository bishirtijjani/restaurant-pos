import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../utils/offline/offlineAxios";

export const fetchInventoryData = createAsyncThunk(
  "inventoryAnalytics/fetchInventoryData",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/analytics/inventory", {
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
    data: null, // { totalValue, foodCostPercentage, turnoverRate, totalWaste }
    status: "idle",
  },
  trends: {
    data: [], // { date, value }
    status: "idle",
  },
  waste: {
    byReason: [], // { reason, value }
    topItems: [], // { name, qty, cost, reason }
    status: "idle",
  },
  lowStock: {
    data: [], // { id, name, currentStock, parLevel, unit }
    status: "idle",
  },
};

export const inventoryAnalyticsSlice = createSlice({
  name: "inventoryAnalytics",
  initialState,
  reducers: {
    setInventoryLoading: (state) => {
      state.overview.status = "loading";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryData.pending, (state) => {
        state.overview.status = "loading";
        state.trends.status = "loading";
        state.waste.status = "loading";
        state.lowStock.status = "loading";
      })
      .addCase(fetchInventoryData.fulfilled, (state, action) => {
        state.overview.status = "succeeded";
        state.overview.data = action.payload.overview;
        state.trends.data = action.payload.trends;
        state.waste.byReason = action.payload.wasteByReason;
        state.waste.topItems = action.payload.wasteTopItems;
        state.lowStock.data = action.payload.lowStock;
      })
      .addCase(fetchInventoryData.rejected, (state) => {
        state.overview.status = "failed";
      });
  },
});

export const { setInventoryData, setInventoryLoading } =
  inventoryAnalyticsSlice.actions;

export const selectInventoryOverview = (state) =>
  state.inventoryAnalytics.overview;
export const selectInventoryTrends = (state) => state.inventoryAnalytics.trends;
export const selectWasteAnalytics = (state) => state.inventoryAnalytics.waste;
export const selectLowStockItems = (state) => state.inventoryAnalytics.lowStock;

export default inventoryAnalyticsSlice.reducer;
