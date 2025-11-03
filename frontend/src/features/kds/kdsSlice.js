// frontend/src/features/kds/kdsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/kds";

// Fetch orders for KDS
export const fetchKDSOrders = createAsyncThunk(
  "kds/fetchOrders",
  async ({ stationId, status }, { rejectWithValue }) => {
    try {
      const query = status ? `?status=${status}` : "";
      const response = await axios.get(
        `${API_URL}/orders/${stationId}${query}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch stations
export const fetchStations = createAsyncThunk(
  "kds/fetchStations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/stations`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Bump order
export const bumpOrder = createAsyncThunk(
  "kds/bumpOrder",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/bump`, {
        reason,
      });
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

// Update order item status
export const updateOrderItemStatus = createAsyncThunk(
  "kds/updateItemStatus",
  async ({ orderId, itemId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/item-status`,
        { itemId, status }
      );
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
  stations: [],
  currentStation: null,
  settings: loadSettingsFromStorage() || defaultSettings,
  loading: false,
  error: null,
  lastUpdate: null,
};

const kdsSlice = createSlice({
  name: "kds",
  initialState,
  reducers: {
    setCurrentStation: (state, action) => {
      state.currentStation = action.payload;
    },
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
        state.currentStation = action.payload.station;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchKDSOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch stations
      .addCase(fetchStations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStations.fulfilled, (state, action) => {
        state.loading = false;
        state.stations = action.payload.data;
      })
      .addCase(fetchStations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bump order
      .addCase(bumpOrder.pending, (state) => {
        state.error = null;
      })
      .addCase(bumpOrder.fulfilled, (state, action) => {
        // Remove the bumped order from the list
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload.data._id
        );
      })
      .addCase(bumpOrder.rejected, (state, action) => {
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
      })

      // Update item status
      .addCase(updateOrderItemStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateOrderItemStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (order) => order._id === action.payload.data._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
      })
      .addCase(updateOrderItemStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setCurrentStation, updateSettings, playSound, clearError } =
  kdsSlice.actions;

export default kdsSlice.reducer;
