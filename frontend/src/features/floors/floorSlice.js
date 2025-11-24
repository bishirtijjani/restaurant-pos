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
      .addCase(deleteFloor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Floor deleted successfully";
        state.floors = state.floors.filter((f) => f._id !== action.meta.arg);
      });
  },
});

export const { resetFloorState, clearCurrentFloor } = floorsSlice.actions;
export default floorsSlice.reducer;
