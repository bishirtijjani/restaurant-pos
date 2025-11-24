import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/floors/";

// Async Thunks
export const getFloors = createAsyncThunk(
  "floors/getAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const createFloor = createAsyncThunk(
  "floors/create",
  async (floorData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(API_URL, floorData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const updateFloor = createAsyncThunk(
  "floors/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(`${API_URL}${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deleteFloor = createAsyncThunk(
  "floors/delete",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.delete(`${API_URL}${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const reorderFloors = createAsyncThunk(
  "floors/reorder",
  async (floorIds, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.patch(
        `${API_URL}reorder`,
        { floorIds },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Re-fetch floors to get updated order
      thunkAPI.dispatch(getFloors());
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const floorSlice = createSlice({
  name: "floors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFloors.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFloors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getFloors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(createFloor.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateFloor.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (floor) => floor._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteFloor.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (floor) => floor._id !== action.payload
        );
      });
  },
});

export const selectFloors = (state) => state.floors.items;
export const selectLoading = (state) => state.floors.loading;
export const selectError = (state) => state.floors.error;

export default floorSlice.reducer;
