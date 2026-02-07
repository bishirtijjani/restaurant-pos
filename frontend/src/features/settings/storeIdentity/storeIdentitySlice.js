import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../utils/offline/offlineAxios";

// Async thunk for executing fetch
export const fetchStoreIdentity = createAsyncThunk(
  "storeIdentity/fetchStoreIdentity",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/stores/current");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch store information",
      );
    }
  },
);

// Async thunk for updating store identity fields
export const updateStoreIdentity = createAsyncThunk(
  "storeIdentity/updateStoreIdentity",
  async ({ storeId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/stores/${storeId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update store information",
      );
    }
  },
);

const initialState = {
  storeInfo: {
    name: "",
    location: "",
    contactPhone: "",
  },
  loading: false,
  error: null,
  successMessage: null,
};

const storeIdentitySlice = createSlice({
  name: "storeIdentity",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    setStoreInfo: (state, action) => {
      state.storeInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch store identity
      .addCase(fetchStoreIdentity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreIdentity.fulfilled, (state, action) => {
        state.loading = false;
        state.storeInfo = {
          name: action.payload.name,
          location: action.payload.location,
          contactPhone: action.payload.contactPhone,
        };
        state.error = null;
      })
      .addCase(fetchStoreIdentity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update store identity
      .addCase(updateStoreIdentity.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateStoreIdentity.fulfilled, (state, action) => {
        state.loading = false;
        state.storeInfo = {
          name: action.payload.name,
          location: action.payload.location,
          contactPhone: action.payload.contactPhone,
        };
        state.successMessage = "Store information updated successfully";
        state.error = null;
      })
      .addCase(updateStoreIdentity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMessage = null;
      });
  },
});

export const { clearError, clearSuccess, setStoreInfo } =
  storeIdentitySlice.actions;

// Selectors
export const selectStoreInfo = (state) => state.storeIdentity.storeInfo;
export const selectStoreIdentityLoading = (state) =>
  state.storeIdentity.loading;
export const selectStoreIdentityError = (state) => state.storeIdentity.error;
export const selectStoreIdentitySuccess = (state) =>
  state.storeIdentity.successMessage;

export default storeIdentitySlice.reducer;
