import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API call to fetch suppliers from the backend
export const fetchAllSuppliers = createAsyncThunk(
  "suppliers/fetchAllSuppliers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/suppliers");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// API call to add a new supplier
export const addSupplier = createAsyncThunk(
  "suppliers/addSupplier",
  async (newSupplier, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/suppliers", newSupplier);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// API call to update an existing supplier
export const updateSupplier = createAsyncThunk(
  "suppliers/updateSupplier",
  async ({ id, supplier }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/suppliers/${id}`, supplier);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// API call to delete a supplier
export const deleteSupplier = createAsyncThunk(
  "suppliers/deleteSupplier",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/suppliers/${id}`);
      return { id }; // Return the deleted supplier's ID for removal in the state
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  suppliers: [],
  status: "idle",
  error: null,
};

const suppliersSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all suppliers
      .addCase(fetchAllSuppliers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllSuppliers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.suppliers = action.payload;
      })
      .addCase(fetchAllSuppliers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add a new supplier
      .addCase(addSupplier.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addSupplier.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.suppliers.push(action.payload);
      })
      .addCase(addSupplier.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update an existing supplier
      .addCase(updateSupplier.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.suppliers.findIndex(
          (supplier) => supplier._id === action.payload._id
        );
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete a supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.suppliers = state.suppliers.filter(
          (supplier) => supplier._id !== action.payload.id
        );
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default suppliersSlice.reducer;
