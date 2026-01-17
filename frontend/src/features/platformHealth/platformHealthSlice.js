// frontend/src/features/platformHealth/platformHealthSlice.js
// Redux slice for platform health monitoring (super-admin)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "/api/platform";

// Async thunks

export const fetchPlatformMetrics = createAsyncThunk(
  "platformHealth/fetchMetrics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/health/detailed`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch platform metrics"
      );
    }
  }
);

export const fetchSystemMetrics = createAsyncThunk(
  "platformHealth/fetchSystemMetrics",
  async (timeRange = "1h", { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/metrics/system`, {
        params: { timeRange },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch system metrics"
      );
    }
  }
);

export const fetchDatabaseMetrics = createAsyncThunk(
  "platformHealth/fetchDatabaseMetrics",
  async (timeRange = "1h", { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/metrics/database`, {
        params: { timeRange },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch database metrics"
      );
    }
  }
);

export const fetchAPIMetrics = createAsyncThunk(
  "platformHealth/fetchAPIMetrics",
  async (timeRange = "1h", { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/metrics/api`, {
        params: { timeRange },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch API metrics"
      );
    }
  }
);

export const fetchPlatformAlerts = createAsyncThunk(
  "platformHealth/fetchAlerts",
  async ({ status = "active", limit = 50 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/alerts`, {
        params: { status, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch alerts"
      );
    }
  }
);

export const acknowledgePlatformAlert = createAsyncThunk(
  "platformHealth/acknowledgeAlert",
  async ({ alertId, note }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE}/alerts/${alertId}/acknowledge`,
        { note }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to acknowledge alert"
      );
    }
  }
);

export const resolvePlatformAlert = createAsyncThunk(
  "platformHealth/resolveAlert",
  async ({ alertId, note }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE}/alerts/${alertId}/resolve`,
        { note }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to resolve alert"
      );
    }
  }
);

// Initial state
const initialState = {
  // Current metrics
  metrics: {
    system: {
      cpu: { usage: 0, cores: 0, loadAverage: [] },
      memory: { used: 0, total: 0, percentage: 0, free: 0 },
      disk: { used: 0, total: 0, percentage: 0, free: 0 },
      uptime: 0,
    },
    database: {
      connectionPool: { active: 0, idle: 0, total: 0 },
      queryLatency: { p50: 0, p95: 0, p99: 0 },
      slowQueries: 0,
    },
    api: {
      requestRate: 0,
      errorRate: 0,
      avgResponseTime: 0,
      activeRequests: 0,
      statusCodes: { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 },
      slowestEndpoints: [],
    },
    websocket: {
      activeConnections: 0,
      messageRate: 0,
      errors: 0,
    },
    queue: {
      pending: 0,
      active: 0,
      completed: 0,
      failed: 0,
    },
    tenants: {
      total: 0,
      active: 0,
      activeUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
    },
  },

  // Historical data
  historicalData: {
    system: [],
    database: [],
    api: [],
  },

  // Alerts
  alerts: [],
  activeAlertsCount: 0,

  // Health status
  health: {
    healthy: true,
    checks: {
      database: false,
      metrics: false,
      monitoring: false,
    },
  },

  // UI state
  selectedTimeRange: "1h",
  loading: false,
  error: null,
  lastUpdated: null,
};

// Slice
const platformHealthSlice = createSlice({
  name: "platformHealth",
  initialState,
  reducers: {
    setTimeRange: (state, action) => {
      state.selectedTimeRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateMetricsRealtime: (state, action) => {
      // Update metrics from WebSocket
      state.metrics = { ...state.metrics, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    addAlertRealtime: (state, action) => {
      // Add new alert from WebSocket
      state.alerts.unshift(action.payload);
      state.activeAlertsCount += 1;
    },
    updateAlertRealtime: (state, action) => {
      // Update alert status from WebSocket
      const index = state.alerts.findIndex(
        (a) => a._id === action.payload.alertId
      );
      if (index !== -1) {
        state.alerts[index] = {
          ...state.alerts[index],
          ...action.payload.updates,
        };
        if (action.payload.updates.status !== "active") {
          state.activeAlertsCount = Math.max(0, state.activeAlertsCount - 1);
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch platform metrics
    builder
      .addCase(fetchPlatformMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatformMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload.metrics || state.metrics;
        state.health = action.payload.health || state.health;
        state.activeAlertsCount = action.payload.activeAlerts || 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchPlatformMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch system metrics
    builder.addCase(fetchSystemMetrics.fulfilled, (state, action) => {
      state.metrics.system = action.payload.latest || state.metrics.system;
      state.historicalData.system = action.payload.historical || [];
    });

    // Fetch database metrics
    builder.addCase(fetchDatabaseMetrics.fulfilled, (state, action) => {
      state.metrics.database = action.payload.latest || state.metrics.database;
      state.historicalData.database = action.payload.historical || [];
    });

    // Fetch API metrics
    builder.addCase(fetchAPIMetrics.fulfilled, (state, action) => {
      state.metrics.api = action.payload.latest || state.metrics.api;
      state.historicalData.api = action.payload.historical || [];
    });

    // Fetch alerts
    builder
      .addCase(fetchPlatformAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatformAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload.alerts || [];
        state.activeAlertsCount = action.payload.count || 0;
      })
      .addCase(fetchPlatformAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Acknowledge alert
    builder.addCase(acknowledgePlatformAlert.fulfilled, (state, action) => {
      const index = state.alerts.findIndex(
        (a) => a._id === action.payload.alert._id
      );
      if (index !== -1) {
        state.alerts[index] = action.payload.alert;
      }
    });

    // Resolve alert
    builder.addCase(resolvePlatformAlert.fulfilled, (state, action) => {
      const index = state.alerts.findIndex(
        (a) => a._id === action.payload.alert._id
      );
      if (index !== -1) {
        state.alerts[index] = action.payload.alert;
        state.activeAlertsCount = Math.max(0, state.activeAlertsCount - 1);
      }
    });
  },
});

export const {
  setTimeRange,
  clearError,
  updateMetricsRealtime,
  addAlertRealtime,
  updateAlertRealtime,
} = platformHealthSlice.actions;

export default platformHealthSlice.reducer;
