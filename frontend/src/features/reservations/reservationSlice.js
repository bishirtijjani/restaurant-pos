// frontend/src/features/reservations/reservationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/offline/offlineAxios";

const API_URL = "/api/reservations";

export const getReservations = createAsyncThunk(
  "reservations/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createReservation = createAsyncThunk(
  "reservations/create",
  async (reservationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, reservationData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateReservation = createAsyncThunk(
  "reservations/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateReservationStatus = createAsyncThunk(
  "reservations/updateStatus",
  async ({ id, status, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, {
        status,
        reason,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteReservation = createAsyncThunk(
  "reservations/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// NEW: Check-in reservation
export const checkInReservation = createAsyncThunk(
  "reservations/checkIn",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/check-in`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  items: [],
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
        state.error = null;
      })
      .addCase(getReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch reservations";
      })
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create reservation";
      })
      .addCase(updateReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update reservation";
      })
      .addCase(updateReservationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReservationStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateReservationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update reservation status";
      })
      .addCase(deleteReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete reservation";
      })
      .addCase(checkInReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkInReservation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(checkInReservation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to check in reservation";
      });
  },
});

import { toZonedTime } from "date-fns-tz";

export const selectTodaysReservations = (state, timezone = "UTC") => {
  const { items } = state.reservations;
  // Get "Now" in Store's Timezone
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const todayStr = zonedNow.toISOString().split("T")[0];

  return items.filter((r) => {
    // Assuming r.reservationDate is stored as UTC ISO string
    // We need to check if that date *in the store's timezone* matches today
    if (r.status === "cancelled") return false;

    const resDate = new Date(r.reservationDate);
    const zonedResDate = toZonedTime(resDate, timezone);
    const resDateStr = zonedResDate.toISOString().split("T")[0];

    return resDateStr === todayStr;
  });
};

export const selectReservedSoon = (
  state,
  timezone = "UTC",
  leadTimeMinutes = 60
) => {
  const { items } = state.reservations;
  const now = new Date();

  // We compare everything in absolute UTC time (timestamps)
  // The "reservationDate" in DB is absolute UTC start time (as per new backend logic).

  return items.filter((r) => {
    if (r.status !== "confirmed" && r.status !== "pending") return false;

    // If legacy data exists where date doesn't have time, this might fail,
    // but new logic ensures reservationDate is full ISO start time.
    const resTime = new Date(r.reservationDate);

    // Check if reservation is for "today" (store time)
    // strictly speaking "soon" just means delta in minutes, regardless of "day" boundary
    const timeDiff = (resTime - now) / 60000; // diff in minutes

    return timeDiff > 0 && timeDiff <= leadTimeMinutes;
  });
};

export default reservationSlice.reducer;
