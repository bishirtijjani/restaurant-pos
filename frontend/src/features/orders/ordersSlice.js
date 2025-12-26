import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API base URL
const API_URL = "/api/orders";

// Async thunks for API operations
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.status) queryParams.append("status", params.status);
      if (params.orderType) queryParams.append("orderType", params.orderType);
      if (params.paymentStatus)
        queryParams.append("paymentStatus", params.paymentStatus);

      // Format dates to ISO strings
      if (params.startDate)
        queryParams.append(
          "startDate",
          new Date(params.startDate).toISOString()
        );
      if (params.endDate)
        queryParams.append("endDate", new Date(params.endDate).toISOString());

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await axios.get(`${API_URL}${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, orderStatus, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/status`, {
        orderStatus,
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePayment = createAsyncThunk(
  "orders/updatePayment",
  async ({ id, amountPaid, paymentMethod, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/payment`, {
        amountPaid,
        paymentMethod,
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        data: { reason },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Void order items
export const voidOrderItems = createAsyncThunk(
  "orders/voidOrderItems",
  async ({ orderId, itemIds, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/void/order/${orderId}/items`, {
        itemIds,
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Refund order
export const refundOrder = createAsyncThunk(
  "orders/refundOrder",
  async ({ orderId, amount, reason, isPartial }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/orders/${orderId}/refund`, {
        amount,
        reason,
        isPartial,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Modify order
export const modifyOrder = createAsyncThunk(
  "orders/modifyOrder",
  async (
    { orderId, orderItems, orderNote, reason, expectedVersion },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`/api/order-modifications/${orderId}`, {
        orderItems,
        orderNote,
        reason,
        expectedVersion,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  orders: [],
  currentOrder: null,
  stats: null,
  filters: {
    status: "",
    orderType: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  },
  loading: false,
  error: null,
  success: false,
  message: "",
};

// Create the slice
const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: "",
        orderType: "",
        paymentStatus: "",
        startDate: "",
        endDate: "",
      };
    },
    resetOrderState: (state) => {
      state.error = null;
      state.success = false;
      state.message = "";
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.success = action.payload.success;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.payload || "Failed to fetch orders";
      })

      // Fetch Order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
        state.success = action.payload.success;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Failed to fetch order details";
      })

      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.message = "Order created successfully";
        state.currentOrder = action.payload.data;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.payload || "Failed to create order";
        state.success = false;
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.message = "Order status updated successfully";
        state.currentOrder = action.payload.data;

        // Update the order in the orders list if it exists
        const index = state.orders.findIndex(
          (order) => order._id === action.payload.data._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Failed to update order status";
        state.success = false;
      })

      // Update Payment
      .addCase(updatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.message = "Payment updated successfully";
        state.currentOrder = action.payload.data;

        // Update the order in the orders list if it exists
        const index = state.orders.findIndex(
          (order) => order._id === action.payload.data._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Failed to update payment";
        state.success = false;
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.message = "Order cancelled successfully";
        state.currentOrder = action.payload.data;

        // Update the order in the orders list if it exists
        const index = state.orders.findIndex(
          (order) => order._id === action.payload.data._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.payload || "Failed to cancel order";
        state.success = false;
      })

      // Void Order Items
      .addCase(voidOrderItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(voidOrderItems.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.message = "Items voided successfully";

        // Update order in list
        const index = state.orders.findIndex(
          (order) => order._id === action.payload.data._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
      })
      .addCase(voidOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.payload || "Failed to void items";
        state.success = false;
      })

      // Refund Order
      .addCase(refundOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(refundOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.message = "Refund processed successfully";

        const index = state.orders.findIndex(
          (order) => order._id === action.payload.data._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
      })
      .addCase(refundOrder.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Failed to process refund";
        state.success = false;
      })

      // Modify Order
      .addCase(modifyOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(modifyOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.message = "Order modified successfully";
        state.currentOrder = action.payload.data;

        const index = state.orders.findIndex(
          (order) => order._id === action.payload.data._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
      })
      .addCase(modifyOrder.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.payload || "Failed to modify order";
        state.success = false;
      });
  },
});

export const { setFilters, clearFilters, resetOrderState, clearCurrentOrder } =
  ordersSlice.actions;

export default ordersSlice.reducer;
