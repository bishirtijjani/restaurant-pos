import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/offline/offlineAxios";

const API_URL = "/api/inventory";

// Fetch all inventory items
export const fetchInventoryItems = createAsyncThunk(
  "inventory/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append("category", params.category);
      if (params.lowStock) queryParams.append("lowStock", "true");

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await axios.get(`${API_URL}${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch single inventory item
export const fetchInventoryItemById = createAsyncThunk(
  "inventory/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create inventory item
export const createInventoryItem = createAsyncThunk(
  "inventory/create",
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update inventory item
export const updateInventoryItem = createAsyncThunk(
  "inventory/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete inventory item
export const deleteInventoryItem = createAsyncThunk(
  "inventory/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch low stock items
export const fetchLowStockItems = createAsyncThunk(
  "inventory/fetchLowStock",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/low-stock`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Link to menu item
export const linkToMenuItem = createAsyncThunk(
  "inventory/linkMenuItem",
  async ({ id, menuItemId, quantityUsed }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/link-menu-item`, {
        menuItemId,
        quantityUsed,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Unlink menu item
export const unlinkMenuItem = createAsyncThunk(
  "inventory/unlinkMenuItem",
  async ({ id, menuItemId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/${id}/unlink-menu-item/${menuItemId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  items: [],
  lowStockItems: [],
  currentItem: null,
  status: "idle",
  error: null,
  success: false,
  message: "",
  loading: false,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = "";
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    replaceTempId: (state, action) => {
      const { tempId, realData } = action.payload;
      const index = state.items.findIndex((item) => item._id === tempId);
      if (index >= 0) {
        state.items[index] = {
          ...realData,
          _synced: true,
          _offline: false,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all items
      .addCase(fetchInventoryItems.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loading = false;
        const serverData = action.payload.data || action.payload;

        // Keep temp items that haven't been synced yet
        const tempItems = state.items.filter(
          (item) => item._tempId && !item._synced
        );

        // Merge server data with temp items, avoiding duplicates
        const serverIds = new Set(serverData.map((item) => item._id));
        const uniqueTempItems = tempItems.filter(
          (item) => !serverIds.has(item._id)
        );

        state.items = [...serverData, ...uniqueTempItems];
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchInventoryItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload.data;
      })
      .addCase(fetchInventoryItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create item
      .addCase(createInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "Item created successfully";

        const newItem = action.payload.data || action.payload;

        // Check if item already exists (by _id or _tempId)
        const existingIndex = state.items.findIndex(
          (item) => item._id === newItem._id || item._tempId === newItem._tempId
        );

        if (existingIndex >= 0) {
          // Replace existing item
          state.items[existingIndex] = {
            ...newItem,
            _synced: true,
            _offline: false,
          };
        } else {
          // Add new item
          state.items.push({
            ...newItem,
            _synced: true,
            _offline: false,
          });
        }
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update item
      .addCase(updateInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "Item updated successfully";

        const updatedItem = action.payload.data;
        const index = state.items.findIndex(
          (item) => item._id === updatedItem._id
        );

        if (index !== -1) {
          // MERGE instead of replace to preserve UI state
          state.items[index] = {
            ...state.items[index],
            ...updatedItem,
            _synced: true,
            _offline: false,
          };
        }

        // Update currentItem if it's the same
        if (state.currentItem?._id === updatedItem._id) {
          state.currentItem = {
            ...state.currentItem,
            ...updatedItem,
          };
        }
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete item
      .addCase(deleteInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Item deleted successfully";
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch low stock
      .addCase(fetchLowStockItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStockItems.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockItems = action.payload.data;
      })
      .addCase(fetchLowStockItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Link menu item
      .addCase(linkToMenuItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(linkToMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItem = action.payload.data;
        const index = state.items.findIndex(
          (item) => item._id === updatedItem._id
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...updatedItem,
          };
        }
        if (state.currentItem?._id === updatedItem._id) {
          state.currentItem = updatedItem;
        }
      })
      .addCase(linkToMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Unlink menu item
      .addCase(unlinkMenuItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(unlinkMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItem = action.payload.data;
        const index = state.items.findIndex(
          (item) => item._id === updatedItem._id
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...updatedItem,
          };
        }
        if (state.currentItem?._id === updatedItem._id) {
          state.currentItem = updatedItem;
        }
      })
      .addCase(unlinkMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentItem, replaceTempId } =
  inventorySlice.actions;

export default inventorySlice.reducer;
