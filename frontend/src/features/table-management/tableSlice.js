import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/tables/";

const tablesAdapter = createEntityAdapter();

const initialState = tablesAdapter.getInitialState({
  loading: false,
  error: null,
});

// Async Thunks
export const getTables = createAsyncThunk(
  "tables/getAll",
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

export const createTable = createAsyncThunk(
  "tables/create",
  async (tableData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(API_URL, tableData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const updateTable = createAsyncThunk(
  "tables/update",
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

export const deleteTable = createAsyncThunk(
  "tables/delete",
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

export const updateTablePosition = createAsyncThunk(
  "tables/updatePosition",
  async ({ id, position }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(
        `${API_URL}${id}`,
        { position },
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

const tableSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTables.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTables.fulfilled, (state, action) => {
        state.loading = false;
        tablesAdapter.setAll(state, action.payload);
      })
      .addCase(getTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(createTable.fulfilled, (state, action) => {
        tablesAdapter.addOne(state, action.payload);
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        tablesAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateTablePosition.fulfilled, (state, action) => {
        tablesAdapter.upsertOne(state, action.payload);
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        tablesAdapter.removeOne(state, action.payload);
      });
  },
});

export const {
  selectAll: selectAllTables,
  selectById: selectTableById,
  selectIds: selectTableIds,
} = tablesAdapter.getSelectors((state) => state.tables);

export const selectTablesByFloor = (state, floorId) =>
  selectAllTables(state).filter((table) => table.floor._id === floorId);

export const selectLoading = (state) => state.tables.loading;
export const selectError = (state) => state.tables.error;

export default tableSlice.reducer;
