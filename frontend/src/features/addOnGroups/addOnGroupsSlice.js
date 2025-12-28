// frontend/src/features/addOnGroups/addOnGroupsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/offline/offlineAxios";

const API_URL = "/api/add-on-groups"; // Fixed: matches backend route

// Fetch all add-on groups
export const fetchAddOnGroups = createAsyncThunk(
  "addOnGroups/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.isActive !== undefined) {
        queryParams.append("isActive", params.isActive);
      }
      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await axios.get(`${API_URL}${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch single add-on group
export const fetchAddOnGroupById = createAsyncThunk(
  "addOnGroups/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create add-on group
export const createAddOnGroup = createAsyncThunk(
  "addOnGroups/create",
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update add-on group
export const updateAddOnGroup = createAsyncThunk(
  "addOnGroups/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete add-on group
export const deleteAddOnGroup = createAsyncThunk(
  "addOnGroups/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch add-on groups for a menu item
export const fetchAddOnGroupsForMenuItem = createAsyncThunk(
  "addOnGroups/fetchForMenuItem",
  async (menuItemId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/menu-item/${menuItemId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  groups: [],
  currentGroup: null,
  menuItemGroups: [],
  loading: false,
  error: null,
  success: false,
  message: "",
};

const addOnGroupsSlice = createSlice({
  name: "addOnGroups",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = "";
    },
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
    },
    clearMenuItemGroups: (state) => {
      state.menuItemGroups = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAddOnGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddOnGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload.data || [];
      })
      .addCase(fetchAddOnGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchAddOnGroupById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddOnGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGroup = action.payload.data;
      })
      .addCase(fetchAddOnGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createAddOnGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAddOnGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "Add-on group created";
        if (action.payload.data) {
          state.groups.push(action.payload.data);
        }
      })
      .addCase(createAddOnGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateAddOnGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAddOnGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "Add-on group updated";
        const index = state.groups.findIndex(
          (g) => g._id === action.payload.data?._id
        );
        if (index !== -1) {
          state.groups[index] = action.payload.data;
        }
      })
      .addCase(updateAddOnGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteAddOnGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAddOnGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter((g) => g._id !== action.payload);
        state.success = true;
        state.message = "Add-on group deleted";
      })
      .addCase(deleteAddOnGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch for menu item
      .addCase(fetchAddOnGroupsForMenuItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddOnGroupsForMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItemGroups = action.payload.data || [];
      })
      .addCase(fetchAddOnGroupsForMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentGroup,
  clearMenuItemGroups,
} = addOnGroupsSlice.actions;
export default addOnGroupsSlice.reducer;
