// frontend/src/features/kds/kdsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/offline/offlineAxios";

const API_URL = "/api/kds";

export const fetchKDSOrders = createAsyncThunk(
  "kds/fetchOrders",
  async ({ stationId, showCompleted }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (showCompleted) {
        params.append("status", "completed");
        params.append("showCompleted", showCompleted);
      } else {
        params.append("status", "pending,preparing");
        params.append("showCompleted", false);
      }

      const query = params.toString() ? `?${params.toString()}` : "";

      const response = await axios.get(
        `${API_URL}/orders/${stationId}${query}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateKDSOrderStatus = createAsyncThunk(
  "kds/updateOrderStatus",
  async ({ orderId, action }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        {
          action, // 'start' or 'complete'
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Recall order
export const recallOrder = createAsyncThunk(
  "kds/recallOrder",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/recall`, {
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Load settings from localStorage
const loadSettingsFromStorage = () => {
  try {
    const savedSettings = localStorage.getItem("kdsSettings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error("Error loading KDS settings:", error);
  }
  return null;
};

const defaultSettings = {
  soundEnabled: true,
  soundVolume: 0.7,
  autoRefresh: true,
  refreshInterval: 30,
  columns: 3,
  fontSize: "medium",
  colorScheme: "default",
};

const initialState = {
  orders: [],
  settings: loadSettingsFromStorage() || defaultSettings,
  loading: false,
  error: null,
  lastUpdate: null,
};

const kdsSlice = createSlice({
  name: "kds",
  initialState,
  reducers: {
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
      try {
        localStorage.setItem("kdsSettings", JSON.stringify(state.settings));
      } catch (error) {
        console.error("Error saving KDS settings:", error);
      }
    },
    playSound: (state) => {
      if (state.settings.soundEnabled) {
        try {
          const audio = new Audio("/notification.mp3");
          audio.volume = state.settings.soundVolume;
          audio.play().catch((e) => console.error("Sound play failed:", e));
        } catch (error) {
          console.error("Error playing sound:", error);
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch orders
      .addCase(fetchKDSOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKDSOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchKDSOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update order status
      .addCase(updateKDSOrderStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateKDSOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload.data;

        // If order was completed (ready), remove it from active view
        if (updatedOrder.orderStatus === "ready") {
          state.orders = state.orders.filter(
            (order) => order._id !== updatedOrder._id
          );
        } else {
          // Update the order in the list
          const index = state.orders.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (index !== -1) {
            state.orders[index] = updatedOrder;
          }
        }
      })
      .addCase(updateKDSOrderStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Recall order
      .addCase(recallOrder.pending, (state) => {
        state.error = null;
      })
      .addCase(recallOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (order) => order._id === action.payload.data._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
      })
      .addCase(recallOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { updateSettings, playSound, clearError } = kdsSlice.actions;

export default kdsSlice.reducer;
