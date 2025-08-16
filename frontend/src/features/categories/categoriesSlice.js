import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getToken } from "../../utils/helpers";

const initialState = {
  categories: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

// Thunks
export const fetchAllCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/categories", {
        headers: {
          Authorization: `${getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch categories"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (category, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/categories", category, {
        headers: {
          Authorization: `${getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create category"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, category }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/categories/${id}`, category, {
        headers: {
          Authorization: `${getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/categories/${id}`, {
        headers: {
          Authorization: `${getToken()}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete category"
      );
    }
  }
);

// Slice
const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (category) => category._id === action.payload._id
        );
        if (index >= 0) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload
        );
      });
  },
});

export default categoriesSlice.reducer;
