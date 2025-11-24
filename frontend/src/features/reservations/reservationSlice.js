import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/reservations/";

// Async Thunks
export const getReservations = createAsyncThunk(
  "reservations/getAll",
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(API_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const createReservation = createAsyncThunk(
  "reservations/create",
  async (reservationData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(API_URL, reservationData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const updateReservation = createAsyncThunk(
  "reservations/update",
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

export const updateReservationStatus = createAsyncThunk(
  "reservations/updateStatus",
  async ({ id, status, reason }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.patch(
        `${API_URL}${id}/status`,
        { status, reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deleteReservation = createAsyncThunk(
  "reservations/delete",
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

export const getAvailableTables = createAsyncThunk(
  "reservations/getAvailableTables",
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(`${API_URL}available-tables`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  items: [],
  availableTables: [],
  loading: false,
  error: null,
};

const reservationSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReservations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (res) => res._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateReservationStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (res) => res._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (res) => res._id !== action.payload
        );
      })
      .addCase(getAvailableTables.fulfilled, (state, action) => {
        state.availableTables = action.payload;
      });
  },
});

export const selectReservations = (state) => state.reservations.items;
export const selectAvailableTables = (state) =>
  state.reservations.availableTables;
export const selectLoading = (state) => state.reservations.loading;
export const selectError = (state) => state.reservations.error;

export default reservationSlice.reducer;
