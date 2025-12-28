import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/offline/offlineAxios";

// Fetch all stores available to the user (detailed list for management)
export const getStores = createAsyncThunk(
  "stores/getStores",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/stores");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stores"
      );
    }
  }
);

export const createStore = createAsyncThunk(
  "stores/createStore",
  async (storeData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/stores", storeData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create store"
      );
    }
  }
);

export const updateStore = createAsyncThunk(
  "stores/updateStore",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/stores/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update store"
      );
    }
  }
);

export const getGlobalOverview = createAsyncThunk(
  "stores/getGlobalOverview",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/analytics/multi-store-overview");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch global overview"
      );
    }
  }
);

const storesSlice = createSlice({
  name: "stores",
  initialState: {
    items: [],
    globalOverview: null,
    loading: false,
    globalLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStores.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createStore.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(getGlobalOverview.pending, (state) => {
        state.globalLoading = true;
      })
      .addCase(getGlobalOverview.fulfilled, (state, action) => {
        state.globalLoading = false;
        state.globalOverview = action.payload;
      })
      .addCase(getGlobalOverview.rejected, (state, action) => {
        state.globalLoading = false;
        state.error = action.payload;
      });
  },
});

export default storesSlice.reducer;
