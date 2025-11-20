// frontend/src/features/expenses/expensesSlice.js
import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  expenses: [],
  status: "idle",
  error: null,
};

export const fetchAllExpenses = createAsyncThunk(
  "expenses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/expenses");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch expenses"
      );
    }
  }
);

export const addExpense = createAsyncThunk(
  "expenses/addExpense",
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/expenses", expenseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async (expense, { rejectWithValue }) => {
    try {
      const id = expense._id;
      const response = await axios.put(`/api/expenses/${id}`, expense);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update expense"
      );
    }
  }
);

export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete expense"
      );
    }
  }
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    replaceTempId: (state, action) => {
      const { tempId, realData } = action.payload;
      const index = state.expenses.findIndex((exp) => exp._id === tempId);
      if (index >= 0) {
        state.expenses[index] = {
          ...realData,
          _synced: true,
          _offline: false,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllExpenses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllExpenses.fulfilled, (state, action) => {
        state.status = "succeeded";
        const serverData = action.payload;
        const tempItems = state.expenses.filter((exp) => exp._tempId);
        state.expenses = [...serverData, ...tempItems];
      })
      .addCase(fetchAllExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        const newExpense = action.payload;
        const exists = state.expenses.find((exp) => exp._id === newExpense._id);
        if (!exists) {
          state.expenses.push(newExpense);
        }
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const updatedExpense = action.payload;
        const index = state.expenses.findIndex(
          (expense) => expense._id === updatedExpense._id
        );
        if (index !== -1) {
          state.expenses[index] = {
            ...state.expenses[index],
            ...updatedExpense,
          };
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(
          (expense) => expense._id !== action.payload
        );
      });
  },
});

export const { replaceTempId } = expensesSlice.actions;
export default expensesSlice.reducer;
