import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/stock-adjustments";

// Fetch all stock adjustments
export const fetchStockAdjustments = createAsyncThunk(
  "stockAdjustments/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.inventoryItem)
        queryParams.append("inventoryItem", params.inventoryItem);
      if (params.type) queryParams.append("type", params.type);
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await axios.get(`${API_URL}${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch single stock adjustment
export const fetchStockAdjustmentById = createAsyncThunk(
  "stockAdjustments/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create stock adjustment
export const createStockAdjustment = createAsyncThunk(
  "stockAdjustments/create",
  async (adjustmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, adjustmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch adjustments by inventory item
export const fetchAdjustmentsByItem = createAsyncThunk(
  "stockAdjustments/fetchByItem",
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/item/${itemId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  adjustments: [],
  currentAdjustment: null,
  loading: false,
  error: null,
  success: false,
  message: "",
};

const stockAdjustmentsSlice = createSlice({
  name: "stockAdjustments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = "";
    },
    clearCurrentAdjustment: (state) => {
      state.currentAdjustment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchStockAdjustments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockAdjustments.fulfilled, (state, action) => {
        state.loading = false;
        state.adjustments = action.payload.data;
      })
      .addCase(fetchStockAdjustments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchStockAdjustmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockAdjustmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAdjustment = action.payload.data;
      })
      .addCase(fetchStockAdjustmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createStockAdjustment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStockAdjustment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(createStockAdjustment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by item
      .addCase(fetchAdjustmentsByItem.fulfilled, (state, action) => {
        state.adjustments = action.payload.data;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentAdjustment } =
  stockAdjustmentsSlice.actions;

export default stockAdjustmentsSlice.reducer;
