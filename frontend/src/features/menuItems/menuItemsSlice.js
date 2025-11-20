// frontend/src/features/menuItems/menuItemsSlice.js
import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  menuItems: [],
  status: "idle",
  error: null,
};

export const fetchAllMenuItems = createAsyncThunk(
  "menuItems/fetchAllMenuItems",
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

export const deleteMenuItem = createAsyncThunk(
  "menuItems/deleteMenuItem",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/menu-items/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete menu item"
      );
    }
  }
);

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
  reducers: {
    // ADD THIS - was missing!
    replaceTempId: (state, action) => {
      const { tempId, realData } = action.payload;
      const index = state.menuItems.findIndex((item) => item._id === tempId);
      if (index >= 0) {
        state.menuItems[index] = {
          ...realData,
          _synced: true,
          _offline: false,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMenuItems.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllMenuItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        const serverData = action.payload;
        const tempItems = state.menuItems.filter((item) => item._tempId);
        state.menuItems = [...serverData, ...tempItems];
      })
      .addCase(fetchAllMenuItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addMenuItem.fulfilled, (state, action) => {
        const newMenuItem = action.payload;
        const exists = state.menuItems.find(
          (item) => item._id === newMenuItem._id
        );
        if (!exists) {
          state.menuItems.push(newMenuItem);
        }
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const updatedMenuItem = action.payload;
        const index = state.menuItems.findIndex(
          (menuItem) => menuItem._id === updatedMenuItem._id
        );
        if (index !== -1) {
          // MERGE instead of replace
          state.menuItems[index] = {
            ...state.menuItems[index],
            ...updatedMenuItem,
          };
        }
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.menuItems = state.menuItems.filter(
          (menuItem) => menuItem._id !== action.payload
        );
      })
      .addCase(toggleMenuItemAvailability.fulfilled, (state, action) => {
        const index = state.menuItems.findIndex(
          (menuItem) => menuItem._id === action.payload._id
        );
        if (index !== -1) {
          state.menuItems[index] = {
            ...state.menuItems[index],
            ...action.payload,
          };
        }
      });
  },
});

export const { replaceTempId } = menuItemsSlice.actions;
export default menuItemsSlice.reducer;
