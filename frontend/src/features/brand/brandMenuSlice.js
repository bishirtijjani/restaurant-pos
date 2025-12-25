import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks
export const fetchBrandMenu = createAsyncThunk(
  "brandMenu/fetchAll",
  async ({ status, category } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (category) params.append("category", category);

      const response = await axios.get(`/api/brand/menu?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brand menu"
      );
    }
  }
);

export const createMasterItem = createAsyncThunk(
  "brandMenu/create",
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/brand/menu", itemData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create master item"
      );
    }
  }
);

export const updateMasterItem = createAsyncThunk(
  "brandMenu/update",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/brand/menu/${id}`, updates);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update master item"
      );
    }
  }
);

export const publishMasterItem = createAsyncThunk(
  "brandMenu/publish",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/brand/menu/${id}/publish`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to publish master item"
      );
    }
  }
);

export const deleteMasterItem = createAsyncThunk(
  "brandMenu/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/brand/menu/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete master item"
      );
    }
  }
);

export const fetchSyncStatus = createAsyncThunk(
  "brandMenu/syncStatus",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/brand/sync/${jobId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sync status"
      );
    }
  }
);

const brandMenuSlice = createSlice({
  name: "brandMenu",
  initialState: {
    items: [],
    currentItem: null,
    syncJobs: {},
    isLoading: false,
    error: null,
    filters: {
      status: "all",
      category: "all",
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentItem: (state, action) => {
      state.currentItem = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch brand menu
      .addCase(fetchBrandMenu.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBrandMenu.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchBrandMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create master item
      .addCase(createMasterItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMasterItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createMasterItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update master item
      .addCase(updateMasterItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMasterItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateMasterItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Publish master item
      .addCase(publishMasterItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(publishMasterItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const { item, syncJob } = action.payload;

        // Update item in list
        const index = state.items.findIndex((i) => i._id === item._id);
        if (index !== -1) {
          state.items[index] = item;
        }

        // Store sync job
        state.syncJobs[syncJob.jobId] = syncJob;
      })
      .addCase(publishMasterItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete master item
      .addCase(deleteMasterItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMasterItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((i) => i._id !== action.payload);
      })
      .addCase(deleteMasterItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch sync status
      .addCase(fetchSyncStatus.fulfilled, (state, action) => {
        state.syncJobs[action.payload.jobId] = action.payload;
      });
  },
});

export const { setFilters, clearError, setCurrentItem } =
  brandMenuSlice.actions;
export default brandMenuSlice.reducer;
