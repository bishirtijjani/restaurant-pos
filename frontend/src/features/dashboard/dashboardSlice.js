// features/dashboard/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    loading: false,
    error: null,
    stats: {
        totalInventoryValue: 0,
        activeOrders: 0,
        itemsNearExpiry: 0,
        monthlyOrders: [],
        lowStockProducts: [],
        expiringProducts: [],
        recentActivity: [],
        categoryCount: 0,
        productCount: 0
    }
};

export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/dashboard');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch dashboard data';
            });
    }
});

export default dashboardSlice.reducer;