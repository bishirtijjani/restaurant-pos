// frontend/src/features/addOnGroups/addOnGroupsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/addon-groups";

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
        state.groups = action.payload.data;
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
        state.message = action.payload.message;
      })
      .addCase(createAddOnGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateAddOnGroup.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
      })

      // Delete
      .addCase(deleteAddOnGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((g) => g._id !== action.payload);
        state.success = true;
      })

      // Fetch for menu item
      .addCase(fetchAddOnGroupsForMenuItem.fulfilled, (state, action) => {
        state.menuItemGroups = action.payload.data;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentGroup } =
  addOnGroupsSlice.actions;
export default addOnGroupsSlice.reducer;
