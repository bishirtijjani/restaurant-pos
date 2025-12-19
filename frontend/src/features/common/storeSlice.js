import { createSlice } from "@reduxjs/toolkit";

const getInitialStoreId = () => {
  try {
    return localStorage.getItem("activeStoreId") || null;
  } catch (e) {
    return null;
  }
};

export const storeSlice = createSlice({
  name: "store",
  initialState: {
    activeStoreId: getInitialStoreId(),
    activeStore: null, // Full store object details
    loading: false,
    error: null,
  },
  reducers: {
    setActiveStore: (state, action) => {
      state.activeStoreId = action.payload;
      localStorage.setItem("activeStoreId", action.payload);
    },
    setActiveStoreDetails: (state, action) => {
      state.activeStore = action.payload;
    },
    clearActiveStore: (state) => {
      state.activeStoreId = null;
      state.activeStore = null;
      localStorage.removeItem("activeStoreId");
    },
  },
});

export const { setActiveStore, setActiveStoreDetails, clearActiveStore } =
  storeSlice.actions;

export default storeSlice.reducer;
