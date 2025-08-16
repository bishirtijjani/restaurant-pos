import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  expenses: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

// Thunk to fetch all expenses
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

// Thunk to add an expense
export const addExpense = createAsyncThunk(
  "expenses/addExpense",
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/expenses", expenseData);

      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Thunk to update an expense
export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async (expense, { rejectWithValue }) => {
    try {
      const id = expense._id;
      const response = await axios.put(`/api/expenses/${id}`, expense);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data || "Failed to update expense"
      );
    }
  }
);

// Thunk to delete an expense
export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      return id; // Return the deleted expense's ID for state update
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all expenses
      .addCase(fetchAllExpenses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllExpenses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.expenses = action.payload;
      })
      .addCase(fetchAllExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add an expense
      .addCase(addExpense.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.expenses.push(action.payload);
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update an expense
      .addCase(updateExpense.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.expenses.findIndex(
          (expense) => expense.id === action.payload.id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload; // Update the expense in the array
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete an expense
      .addCase(deleteExpense.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.expenses = state.expenses.filter(
          (expense) => expense._id !== action.payload
        );
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default expensesSlice.reducer;
