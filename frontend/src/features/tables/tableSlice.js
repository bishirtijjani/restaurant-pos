// frontend/src/features/tables/tableSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/tables";

export const fetchTables = createAsyncThunk(
  "tables/fetchTables",
  async (params = {}, { rejectWithValue }) => {
    console.log("Fetching tables with params:", params.floorId);
    try {
      const queryParams = new URLSearchParams();
      if (params.floorId) queryParams.append("floorId", params.floorId);
      if (params.status) queryParams.append("status", params.status);
      if (params.isActive !== undefined)
        queryParams.append("isActive", params.isActive);

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await axios.get(`${API_URL}${query}`);
      console.log("Fetched tables response:", response);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTableById = createAsyncThunk(
  "tables/fetchTableById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createTable = createAsyncThunk(
  "tables/createTable",
  async (tableData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, tableData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTable = createAsyncThunk(
  "tables/updateTable",
  async ({ id, ...tableData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, tableData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTableStatus = createAsyncThunk(
  "tables/updateTableStatus",
  async ({ id, status, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/status`, {
        status,
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTablePosition = createAsyncThunk(
  "tables/updateTablePosition",
  async ({ id, position }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/position`, {
        position,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const linkTableToOrder = createAsyncThunk(
  "tables/linkTableToOrder",
  async ({ id, orderId }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/link-order`, {
        orderId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const unlinkTableFromOrder = createAsyncThunk(
  "tables/unlinkTableFromOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/unlink-order`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const mergeTables = createAsyncThunk(
  "tables/mergeTables",
  async ({ tableIds, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/merge`, {
        tableIds,
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const splitTables = createAsyncThunk(
  "tables/splitTables",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/split`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const safeUnmergeTables = createAsyncThunk(
  "tables/safeUnmergeTables",
  async ({ id, reason }, { dispatch, rejectWithValue }) => {
    try {
      // 1. Perform the split
      const resultAction = await dispatch(splitTables({ id, reason }));
      if (splitTables.rejected.match(resultAction)) {
        throw resultAction.payload;
      }

      const updatedTables = resultAction.payload?.data;

      // Defensive check
      if (!updatedTables || !Array.isArray(updatedTables)) {
        console.warn(
          "safeUnmergeTables: No tables returned from split operation"
        );
        return resultAction.payload;
      }

      // 2. Cleanup: Check for tables that are occupied but have no order
      const cleanupPromises = updatedTables.map(async (table) => {
        if (table && table.status === "occupied" && !table.currentOrder) {
          // It was likely a secondary table in a group. Set to cleaning to require cleanup.
          return dispatch(
            updateTableStatus({
              id: table._id,
              status: "cleaning",
              reason: "Unmerged cleanup",
            })
          );
        }
        return Promise.resolve();
      });

      await Promise.all(cleanupPromises);

      return resultAction.payload;
    } catch (error) {
      console.error("safeUnmergeTables error:", error);
      return rejectWithValue(error.message || error);
    }
  }
);

export const deleteTable = createAsyncThunk(
  "tables/deleteTable",
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
  tables: [],
  currentTable: null,
  loading: false,
  error: null,
  success: false,
  message: "",
};

const tableSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    resetTableState: (state) => {
      state.error = null;
      state.success = false;
      state.message = "";
    },
    clearCurrentTable: (state) => {
      state.currentTable = null;
    },
    optimisticUpdateTablePosition: (state, action) => {
      const { tableId, position } = action.payload;
      const index = state.tables.findIndex((t) => t._id === tableId);
      if (index !== -1) {
        state.tables[index].position = position;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload.data;
        state.success = action.payload.success;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch tables";
      })
      .addCase(fetchTableById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTableById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTable = action.payload.data;
      })
      .addCase(fetchTableById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch table";
      })
      .addCase(createTable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTable.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Table created successfully";
        state.tables.push(action.payload.data);
      })
      .addCase(createTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create table";
      })
      .addCase(updateTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Table updated successfully";
        const index = state.tables.findIndex(
          (t) => t._id === action.payload.data._id
        );
        if (index !== -1) state.tables[index] = action.payload.data;
      })
      .addCase(updateTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update table";
      })
      .addCase(updateTableStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tables.findIndex(
          (t) => t._id === action.payload.data._id
        );
        if (index !== -1) state.tables[index] = action.payload.data;
      })
      .addCase(updateTablePosition.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tables.findIndex(
          (t) => t._id === action.payload.data._id
        );
        if (index !== -1) state.tables[index] = action.payload.data;
      })
      .addCase(linkTableToOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tables.findIndex(
          (t) => t._id === action.payload.data._id
        );
        if (index !== -1) state.tables[index] = action.payload.data;
      })
      .addCase(unlinkTableFromOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tables.findIndex(
          (t) => t._id === action.payload.data._id
        );
        if (index !== -1) state.tables[index] = action.payload.data;
      })
      .addCase(mergeTables.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Tables merged successfully";
        action.payload.data.forEach((updatedTable) => {
          const index = state.tables.findIndex(
            (t) => t._id === updatedTable._id
          );
          if (index !== -1) state.tables[index] = updatedTable;
        });
      })
      .addCase(splitTables.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Tables split successfully";
        action.payload.data.forEach((updatedTable) => {
          const index = state.tables.findIndex(
            (t) => t._id === updatedTable._id
          );
          if (index !== -1) state.tables[index] = updatedTable;
        });
      })
      .addCase(deleteTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Table deleted successfully";
        state.tables = state.tables.filter((t) => t._id !== action.meta.arg);
      })
      .addCase(deleteTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete table";
      });
  },
});

export const {
  resetTableState,
  clearCurrentTable,
  optimisticUpdateTablePosition,
} = tableSlice.actions;
export default tableSlice.reducer;
