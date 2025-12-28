import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/offline/offlineAxios";

const API_URL = "/api/purchase-orders";

// Fetch all purchase orders
export const fetchPurchaseOrders = createAsyncThunk(
  "purchaseOrders/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append("status", params.status);
      if (params.supplier) queryParams.append("supplier", params.supplier);
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

// Fetch single purchase order
export const fetchPurchaseOrderById = createAsyncThunk(
  "purchaseOrders/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create purchase order
export const createPurchaseOrder = createAsyncThunk(
  "purchaseOrders/create",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update purchase order
export const updatePurchaseOrder = createAsyncThunk(
  "purchaseOrders/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Approve purchase order
export const approvePurchaseOrder = createAsyncThunk(
  "purchaseOrders/approve",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Receive purchase order
export const receivePurchaseOrder = createAsyncThunk(
  "purchaseOrders/receive",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/receive`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Cancel purchase order
export const cancelPurchaseOrder = createAsyncThunk(
  "purchaseOrders/cancel",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update payment status
export const updatePaymentStatus = createAsyncThunk(
  "purchaseOrders/updatePayment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/payment`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  success: false,
  message: "",
};

const purchaseOrdersSlice = createSlice({
  name: "purchaseOrders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = "";
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    replaceTempId: (state, action) => {
      const { tempId, realData } = action.payload;
      const index = state.orders.findIndex((item) => item._id === tempId);
      if (index !== -1) {
        state.orders[index] = {
          ...realData,
          _synced: true,
          _offline: false,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchPurchaseOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(fetchPurchaseOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Approve
      .addCase(approvePurchaseOrder.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
      })

      // Receive
      .addCase(receivePurchaseOrder.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
      })

      // Cancel
      .addCase(cancelPurchaseOrder.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentOrder } =
  purchaseOrdersSlice.actions;

export default purchaseOrdersSlice.reducer;
