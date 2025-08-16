import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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

const initialState = {
  customers: [],
  status: "idle",
  error: null,
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
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
      });
  },
});

export default customersSlice.reducer;
