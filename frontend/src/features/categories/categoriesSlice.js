// frontend/src/features/categories/categoriesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import offlineAxios from "../../utils/offline/offlineAxios";
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
      const response = await offlineAxios.get("/api/categories", {
        headers: { Authorization: `${getToken()}` },
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
      const response = await offlineAxios.post("/api/categories", category, {
        headers: { Authorization: `${getToken()}` },
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
      const response = await offlineAxios.put(
        `/api/categories/${id}`,
        category,
        {
          headers: { Authorization: `${getToken()}` },
        }
      );
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
      await offlineAxios.delete(`/api/categories/${id}`, {
        headers: { Authorization: `${getToken()}` },
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
        const serverData = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
        const tempItems = state.categories.filter((cat) => cat._tempId);
        state.categories = [...serverData, ...tempItems];
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        const newCategory = action.payload;
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
          state.categories[index] = {
            ...state.categories[index],
            ...updatedCategory,
          };
        }
        state.status = "succeeded";
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
