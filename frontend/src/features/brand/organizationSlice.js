import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/offline/offlineAxios";

export const fetchOrganization = createAsyncThunk(
  "organization/fetchOrganization",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/organizations/${id}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "organization/updateOrganization",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/organizations/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const organizationSlice = createSlice({
  name: "organization",
  initialState: {
    entity: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearOrgError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Organization
      .addCase(fetchOrganization.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entity = action.payload;
      })
      .addCase(fetchOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Failed to fetch organization";
      })
      // Update Organization
      .addCase(updateOrganization.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entity = action.payload.data;
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Failed to update organization";
      });
  },
});

export const { clearOrgError } = organizationSlice.actions;
export default organizationSlice.reducer;
