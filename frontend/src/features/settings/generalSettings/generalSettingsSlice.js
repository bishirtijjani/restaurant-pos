import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../utils/offline/offlineAxios";

// API base URL - adjust as needed
const API_URL = "/api/general-settings";

// Async thunk for fetching settings
export const fetchSettings = createAsyncThunk(
  "generalSettings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data; // Now returns { success, data, overrides }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch settings",
      );
    }
  },
);

// Async thunk for updating settings
export const updateSettings = createAsyncThunk(
  "generalSettings/updateSettings",
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await axios.put(API_URL, settingsData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update settings",
      );
    }
  },
);

// Async thunk for resetting settings
export const resetSettings = createAsyncThunk(
  "generalSettings/resetSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/reset`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset settings",
      );
    }
  },
);

const initialState = {
  generalSettings: {
    // Store identity fields removed (name, address, phone)
    // These are now top-level Store fields, not settings
    restaurantEmail: "",
    restaurantMotto: "",
    currency: {
      code: "USD",
      name: "US Dollar",
      symbol: "",
    },
    dateFormat: "MM/DD/YYYY",
    lowStockAlert: 10,
    autoGenerateSKU: true,
    taxRate: 0,
    emailNotifications: true,
    timezone: "America/New_York",
    // Add tax settings here
    taxSettings: {
      enabled: true,
      globalRate: 7.5,
      name: "VAT",
      mode: "per-item",
      includeInPrice: false,
    },
    serviceCharge: {
      enabled: false,
      rate: 0,
      name: "Service Charge",
      applyTo: "dine-in",
    },
    printerSettings: {
      mode: "browser",
      paperWidth: "80mm",
      vendorId: null,
      productId: null,
      deviceName: null,
    },
  },
  loading: false,
  overrides: {},
  error: null,
  successMessage: null,
};

const generalSettingsSlice = createSlice({
  name: "generalSettings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    updateLocalSettings: (state, action) => {
      state.generalSettings = { ...state.generalSettings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.generalSettings = action.payload.data;
        state.overrides = action.payload.overrides || {};
        state.error = null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.generalSettings = action.payload; // backend updateSettings currently returns .data directly
        state.successMessage = "Settings updated successfully";
        state.error = null;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMessage = null;
      })

      // Reset settings
      .addCase(resetSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.generalSettings = action.payload;
        state.overrides = {}; // Reset clears overrides
        state.successMessage = "Settings reset to defaults successfully";
        state.error = null;
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMessage = null;
      });
  },
});

export const { clearError, clearSuccess, updateLocalSettings } =
  generalSettingsSlice.actions;

// Selectors
export const selectSettings = (state) => state.generalSettings.generalSettings;
export const selectSettingsOverrides = (state) =>
  state.generalSettings.overrides;
export const selectSettingsLoading = (state) => state.generalSettings.loading;
export const selectSettingsError = (state) => state.generalSettings.error;
export const selectSettingsSuccess = (state) =>
  state.generalSettings.successMessage;

export default generalSettingsSlice.reducer;
