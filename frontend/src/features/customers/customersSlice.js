import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/offline/offlineAxios";

// API call to fetch customers from the backend
export const fetchAllCustomers = createAsyncThunk(
  "customers/fetchAllCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/customers");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// API call to add a new customer
export const addCustomer = createAsyncThunk(
  "customers/addCustomer",
  async (newCustomer, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/customers", newCustomer);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// API call to update an existing customer
export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, customer }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/customers/${id}`, customer);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// API call to delete a customer
export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/customers/${id}`);
      return { id }; // Return the deleted customer's ID for removal in the state
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// API call to fetch customer profile
export const fetchCustomerProfile = createAsyncThunk(
  "customers/fetchCustomerProfile",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/customers/${id}/profile`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// API call to add a note
export const addCustomerNote = createAsyncThunk(
  "customers/addCustomerNote",
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/customers/${id}/notes`, {
        content,
      });
      return { id, notes: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// API call to record a payment
export const recordCustomerPayment = createAsyncThunk(
  "customers/recordCustomerPayment",
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/customers/${id}/payments`,
        paymentData
      );
      return { id, payment: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  customers: [],
  status: "idle",
  error: null,
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    replaceTempId: (state, action) => {
      const { tempId, realData } = action.payload;
      const index = state.customers.findIndex((item) => item._id === tempId);
      if (index !== -1) {
        state.customers[index] = {
          ...realData,
          _synced: true,
          _offline: false,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all customers
      .addCase(fetchAllCustomers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllCustomers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = action.payload;
      })
      .addCase(fetchAllCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add a new customer
      .addCase(addCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.push(action.payload);
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update an existing customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(
          (customer) => customer._id === action.payload._id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        // Also update currentCustomerProfile if it matches
        if (
          state.currentCustomerProfile?.customer?._id === action.payload._id
        ) {
          state.currentCustomerProfile.customer = {
            ...state.currentCustomerProfile.customer,
            ...action.payload,
          };
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete a customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(
          (customer) => customer._id !== action.payload.id
        );
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Customer Profile
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentCustomerProfile = action.payload;
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add Note
      .addCase(addCustomerNote.fulfilled, (state, action) => {
        if (state.currentCustomerProfile?.customer?._id === action.payload.id) {
          state.currentCustomerProfile.customer.notes = action.payload.notes;
        }
      })
      // Record Payment
      .addCase(recordCustomerPayment.fulfilled, (state, action) => {
        if (state.currentCustomerProfile?.customer?._id === action.payload.id) {
          state.currentCustomerProfile.payments.unshift(action.payload.payment);
          // Update stats locally: reduce outstanding balance by payment amount
          if (state.currentCustomerProfile.stats) {
            state.currentCustomerProfile.stats.outstandingBalance -=
              action.payload.payment.amount;
          }
        }
      });
  },
});

export default customersSlice.reducer;
