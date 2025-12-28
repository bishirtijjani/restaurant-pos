import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/offline/offlineAxios";

const API_URL = "/api/stations";

// Fetch stations
export const fetchStations = createAsyncThunk(
  "kds/fetchStations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create station
export const createStation = createAsyncThunk(
  "kds/createStation",
  async (stationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}`, stationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update station
export const updateStation = createAsyncThunk(
  "kds/updateStation",
  async ({ id, ...stationData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, stationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete station
export const deleteStation = createAsyncThunk(
  "kds/deleteStation",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const kdsStationsSlice = createSlice({
  name: "kdsStations",
  initialState: {
    stations: [],
    currentStation: { name: "All Stations", type: "all" },
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentStation: (state, action) => {
      state.currentStation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stations
      .addCase(fetchStations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStations.fulfilled, (state, action) => {
        state.loading = false;
        state.stations = action.payload.data;
      })
      .addCase(fetchStations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create station
      .addCase(createStation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStation.fulfilled, (state, action) => {
        state.loading = false;
        state.stations.push(action.payload.data);
      })
      .addCase(createStation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update station
      .addCase(updateStation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stations.findIndex(
          (s) => s._id === action.payload.data._id
        );
        if (index !== -1) {
          state.stations[index] = action.payload.data;
        }
      })
      .addCase(updateStation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete station
      .addCase(deleteStation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStation.fulfilled, (state, action) => {
        state.loading = false;
        state.stations = state.stations.filter(
          (s) => s._id !== action.meta.arg
        );
      })
      .addCase(deleteStation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentStation } = kdsStationsSlice.actions;

export default kdsStationsSlice.reducer;
