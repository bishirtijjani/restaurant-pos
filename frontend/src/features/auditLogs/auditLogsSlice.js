import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getAuditLogs = createAsyncThunk(
  "auditLogs/getAuditLogs",
  async (params, thunkAPI) => {
    try {
      // params: { page, limit, startDate, endDate, userId, entityType, action, search }
      const response = await axios.get("/api/logs", { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const getLogFilters = createAsyncThunk(
  "auditLogs/getLogFilters",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("/api/logs/filters");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

const auditLogsSlice = createSlice({
  name: "auditLogs",
  initialState: {
    logs: [],
    pagination: {
      total: 0,
      page: 1,
      pages: 1,
    },
    filters: {
      actions: [],
      entityTypes: [],
      users: [],
    },
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAuditLogs
      .addCase(getAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch logs";
      })
      // getLogFilters
      .addCase(getLogFilters.fulfilled, (state, action) => {
        state.filters = action.payload.data;
      });
  },
});

export default auditLogsSlice.reducer;
