import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  purchases: [],
  // purchase: null,
  status: "idle",
  error: null,
};

// Thunks
export const fetchAllPurchases = createAsyncThunk(
  "purchase/fetchAllPurchases",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/purchase");
      return response.data.purchases;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update product"
      );
    }
  }
);

export const fetchPurchaseById = createAsyncThunk(
  "purchase/fetchPurchaseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/purchase/${id}`);
      return response.data.purchase;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data || "Failed to update product"
      );
    }
  }
);

export const createPurchase = createAsyncThunk(
  "purchase/createPurchase",
  async (purchaseData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/purchase", purchaseData);
      return response.data.purchase;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update product"
      );
    }
  }
);

export const updatePurchase = createAsyncThunk(
  "purchase/updatePurchase",
  async ({ id, purchaseData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/purchase/${id}`, purchaseData);
      return response.data.purchase;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data || "Failed to update purchase"
      );
    }
  }
);

export const deletePurchase = createAsyncThunk(
  "purchase/deletePurchase",
  async (id) => {
    const response = await axios.delete(`/api/purchase/${id}`);
    return response.data.purchase;
  }
);

// Slice
const purchaseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPurchases.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllPurchases.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.purchases = action.payload;
      })
      .addCase(fetchAllPurchases.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchPurchaseById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPurchaseById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.purchase = action.payload;
      })
      .addCase(fetchPurchaseById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createPurchase.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.purchases.push(action.payload);
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updatePurchase.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.purchases.findIndex(
          (purchase) => purchase._id === action.payload._id
        );
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deletePurchase.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.purchases = state.purchases.filter(
          (purchase) => purchase._id !== action.payload._id
        );
      })
      .addCase(deletePurchase.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default purchaseSlice.reducer;
