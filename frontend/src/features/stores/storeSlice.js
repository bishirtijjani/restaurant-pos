import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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

const storesSlice = createSlice({
  name: "stores",
  initialState: {
    items: [],
    loading: false,
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
      });
  },
});

export default storesSlice.reducer;
