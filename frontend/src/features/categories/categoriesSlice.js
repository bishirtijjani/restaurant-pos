// frontend/src/features/categories/categoriesSlice.js
import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getToken } from "../../utils/Helpers";

const initialState = {
  categories: [],
  status: "idle",
  error: null,
};

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

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    // Add reducer for replacing temp IDs
    replaceTempId: (state, action) => {
      const { tempId, realData } = action.payload;
      const index = state.categories.findIndex((cat) => cat._id === tempId);
      if (index >= 0) {
        state.categories[index] = {
          ...realData,
          _synced: true,
          _offline: false,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Filter out temp items and merge with server data
        const serverData = action.payload;
        const tempItems = state.categories.filter((cat) => cat._tempId);
        state.categories = [...serverData, ...tempItems];
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        const newCategory = action.payload;
        // Check if it already exists (offline optimistic update)
        const exists = state.categories.find(
          (cat) => cat._id === newCategory._id
        );
        if (!exists) {
          state.categories.push(newCategory);
        }
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const updatedCategory = action.payload;
        const index = state.categories.findIndex(
          (category) => category._id === updatedCategory._id
        );
        if (index >= 0) {
          state.categories[index] = updatedCategory;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload
        );
      });
  },
});

export const { replaceTempId } = categoriesSlice.actions;
export default categoriesSlice.reducer;
