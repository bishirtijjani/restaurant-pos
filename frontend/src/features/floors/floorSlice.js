import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/floors";

export const fetchFloors = createAsyncThunk(
  "floors/fetchFloors",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.isActive !== undefined)
        queryParams.append("isActive", params.isActive);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await axios.get(`${API_URL}${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFloorById = createAsyncThunk(
  "floors/fetchFloorById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createFloor = createAsyncThunk(
  "floors/createFloor",
  async (floorData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, floorData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFloor = createAsyncThunk(
  "floors/updateFloor",
  async ({ id, ...floorData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, floorData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFloorLayout = createAsyncThunk(
  "floors/updateFloorLayout",
  async ({ id, layout }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/layout`, { layout });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTablePositions = createAsyncThunk(
  "floors/updateTablePositions",
  async ({ floorId, tables }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/${floorId}/table-positions`,
        { tables }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFloor = createAsyncThunk(
  "floors/deleteFloor",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  floors: [],
  currentFloor: null,
  loading: false,
  error: null,
  success: false,
  message: "",
  pendingUpdates: [],
  lastSync: null,
};

const floorsSlice = createSlice({
  name: "floors",
  initialState,
  reducers: {
    resetFloorState: (state) => {
      state.error = null;
      state.success = false;
      state.message = "";
    },
    clearCurrentFloor: (state) => {
      state.currentFloor = null;
    },
    updateFloorFromSocket: (state, action) => {
      const index = state.floors.findIndex((f) => f._id === action.payload._id);
      if (index !== -1) {
        state.floors[index] = { ...state.floors[index], ...action.payload };
      }
      if (state.currentFloor?._id === action.payload._id) {
        state.currentFloor = { ...state.currentFloor, ...action.payload };
      }
    },
    // NEW: Optimistic update for drag-and-drop
    optimisticUpdateTablePosition: (state, action) => {
      const { tableId, position } = action.payload;
      if (state.currentFloor?.tables) {
        const tableIndex = state.currentFloor.tables.findIndex(
          (t) => t._id === tableId
        );
        if (tableIndex !== -1) {
          state.currentFloor.tables[tableIndex].position = position;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFloors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFloors.fulfilled, (state, action) => {
        state.loading = false;
        state.floors = action.payload.data;
        state.success = action.payload.success;
        state.lastSync = Date.now();
      })
      .addCase(fetchFloors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch floors";
      })
      .addCase(fetchFloorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFloorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFloor = action.payload.data;
      })
      .addCase(fetchFloorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch floor";
      })
      .addCase(createFloor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFloor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Floor created successfully";
        state.floors.push(action.payload.data);
      })
      .addCase(createFloor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create floor";
      })
      .addCase(updateFloor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Floor updated successfully";
        const index = state.floors.findIndex(
          (f) => f._id === action.payload.data._id
        );
        if (index !== -1) state.floors[index] = action.payload.data;
      })
      .addCase(updateFloorLayout.fulfilled, (state, action) => {
        const index = state.floors.findIndex(
          (f) => f._id === action.payload.data._id
        );
        if (index !== -1) {
          state.floors[index] = action.payload.data;
        }
        if (state.currentFloor?._id === action.payload.data._id) {
          state.currentFloor = action.payload.data;
        }
        state.success = true;
        state.message = "Layout updated";
      })
      .addCase(updateTablePositions.fulfilled, (state, action) => {
        state.success = true;
        state.message = "Table positions saved";
      })
      .addCase(deleteFloor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Floor deleted successfully";
        state.floors = state.floors.filter((f) => f._id !== action.meta.arg);
      });
  },
});

export const {
  resetFloorState,
  clearCurrentFloor,
  updateFloorFromSocket,
  optimisticUpdateTablePosition,
} = floorsSlice.actions;
export default floorsSlice.reducer;
