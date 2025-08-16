import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  menuItems: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

// Thunk to fetch all menu items
export const fetchAllMenuItems = createAsyncThunk(
  "menuItems/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/menu-items");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch menu items"
      );
    }
  }
);

// Thunk to add a menu item
export const addMenuItem = createAsyncThunk(
  "menuItems/addMenuItem",
  async (menuItemData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/menu-items", menuItemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Thunk to update a menu item
export const updateMenuItem = createAsyncThunk(
  "menuItems/updateMenuItem",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/menu-items/${id}`, updatedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update menu item"
      );
    }
  }
);

// Thunk to delete a menu item
export const deleteMenuItem = createAsyncThunk(
  "menuItems/deleteMenuItem",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/menu-items/${id}`);
      return id; // Return the deleted menu item's ID for state update
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete menu item"
      );
    }
  }
);

// Thunk to toggle menu item availability
export const toggleMenuItemAvailability = createAsyncThunk(
  "menuItems/toggleAvailability",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `/api/menu-items/${id}/toggle-availability`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update menu item availability"
      );
    }
  }
);

const menuItemsSlice = createSlice({
  name: "menuItems",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all menu items
      .addCase(fetchAllMenuItems.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllMenuItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.menuItems = action.payload;
      })
      .addCase(fetchAllMenuItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add a menu item
      .addCase(addMenuItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addMenuItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.menuItems.push(action.payload);
      })
      .addCase(addMenuItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update a menu item
      .addCase(updateMenuItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.menuItems.findIndex(
          (menuItem) => menuItem._id === action.payload._id
        );
        if (index !== -1) {
          state.menuItems[index] = action.payload; // Update the menu item in the array
        }
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete a menu item
      .addCase(deleteMenuItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.menuItems = state.menuItems.filter(
          (menuItem) => menuItem._id !== action.payload
        );
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Toggle menu item availability
      .addCase(toggleMenuItemAvailability.fulfilled, (state, action) => {
        const index = state.menuItems.findIndex(
          (menuItem) => menuItem._id === action.payload._id
        );
        if (index !== -1) {
          state.menuItems[index] = action.payload;
        }
      });
  },
});

export default menuItemsSlice.reducer;
