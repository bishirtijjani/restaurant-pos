// frontend/src/features/discounts/discountsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/discounts";
const PROMO_API_URL = "/api/promo-codes";

// Discount thunks
export const fetchDiscounts = createAsyncThunk(
  "discounts/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_URL}?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActiveDiscounts = createAsyncThunk(
  "discounts/fetchActive",
  async (orderType = "dine-in", { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/active?orderType=${orderType}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createDiscount = createAsyncThunk(
  "discounts/create",
  async (discountData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, discountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateDiscount = createAsyncThunk(
  "discounts/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteDiscount = createAsyncThunk(
  "discounts/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleDiscountStatus = createAsyncThunk(
  "discounts/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/toggle`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Promo code thunks
export const fetchPromoCodes = createAsyncThunk(
  "discounts/fetchPromoCodes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`${PROMO_API_URL}?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const validatePromoCode = createAsyncThunk(
  "discounts/validatePromoCode",
  async ({ code, orderAmount, orderType, customerId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${PROMO_API_URL}/validate`, {
        code,
        orderAmount,
        orderType,
        customerId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPromoCode = createAsyncThunk(
  "discounts/createPromoCode",
  async (promoData, { rejectWithValue }) => {
    try {
      const response = await axios.post(PROMO_API_URL, promoData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePromoCode = createAsyncThunk(
  "discounts/updatePromoCode",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${PROMO_API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePromoCode = createAsyncThunk(
  "discounts/deletePromoCode",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${PROMO_API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  discounts: [],
  promoCodes: [],
  activeDiscounts: {
    happyHour: [],
    regular: [],
    all: [],
  },
  validatedPromo: null,
  loading: false,
  promoLoading: false,
  error: null,
  success: false,
};

const discountsSlice = createSlice({
  name: "discounts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearValidatedPromo: (state) => {
      state.validatedPromo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch discounts
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload.data;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch discounts";
      })

      // Fetch active discounts
      .addCase(fetchActiveDiscounts.fulfilled, (state, action) => {
        state.activeDiscounts = action.payload.data;
      })

      // Create discount
      .addCase(createDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts.unshift(action.payload.data);
        state.success = true;
      })
      .addCase(createDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create discount";
      })

      // Update discount
      .addCase(updateDiscount.fulfilled, (state, action) => {
        const index = state.discounts.findIndex(
          (d) => d._id === action.payload.data._id
        );
        if (index !== -1) {
          state.discounts[index] = action.payload.data;
        }
        state.success = true;
      })

      // Delete discount
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.discounts = state.discounts.filter(
          (d) => d._id !== action.payload
        );
        state.success = true;
      })

      // Toggle status
      .addCase(toggleDiscountStatus.fulfilled, (state, action) => {
        const index = state.discounts.findIndex(
          (d) => d._id === action.payload.data._id
        );
        if (index !== -1) {
          state.discounts[index] = action.payload.data;
        }
      })

      // Fetch promo codes
      .addCase(fetchPromoCodes.pending, (state) => {
        state.promoLoading = true;
      })
      .addCase(fetchPromoCodes.fulfilled, (state, action) => {
        state.promoLoading = false;
        state.promoCodes = action.payload.data;
      })
      .addCase(fetchPromoCodes.rejected, (state, action) => {
        state.promoLoading = false;
        state.error = action.payload?.message || "Failed to fetch promo codes";
      })

      // Validate promo code
      .addCase(validatePromoCode.pending, (state) => {
        state.promoLoading = true;
        state.validatedPromo = null;
      })
      .addCase(validatePromoCode.fulfilled, (state, action) => {
        state.promoLoading = false;
        state.validatedPromo = action.payload.data;
      })
      .addCase(validatePromoCode.rejected, (state, action) => {
        state.promoLoading = false;
        state.validatedPromo = null;
        state.error = action.payload?.message || "Invalid promo code";
      })

      // Create promo code
      .addCase(createPromoCode.fulfilled, (state, action) => {
        state.promoCodes.unshift(action.payload.data);
        state.success = true;
      })

      // Update promo code
      .addCase(updatePromoCode.fulfilled, (state, action) => {
        const index = state.promoCodes.findIndex(
          (p) => p._id === action.payload.data._id
        );
        if (index !== -1) {
          state.promoCodes[index] = action.payload.data;
        }
        state.success = true;
      })

      // Delete promo code
      .addCase(deletePromoCode.fulfilled, (state, action) => {
        state.promoCodes = state.promoCodes.filter(
          (p) => p._id !== action.payload
        );
        state.success = true;
      });
  },
});

export const { clearError, clearSuccess, clearValidatedPromo } =
  discountsSlice.actions;
export default discountsSlice.reducer;
