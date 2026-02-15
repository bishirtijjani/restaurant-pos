// frontend/src/features/orders/mobilePOSSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Active tab
  activeTab: "menu", // 'menu' | 'cart' | 'payment' | 'more'

  // Active bottom sheet
  activeSheet: null, // null | 'addons' | 'discount' | 'customer' | 'ordertype'

  // Cart preview state
  cartPreviewExpanded: false,

  // Search state
  searchFocused: false,
  searchHistory: [],

  // Offline mode
  offlineMode: false,
  pendingOrders: [],

  // Quick actions
  recentOrders: [],
  favoriteItems: [],

  // UI state
  showFloatingCart: true,
  showFAB: true,

  // Gesture hints
  showSwipeHints: true,
  hintsShown: {
    swipeCart: false,
    swipeTabs: false,
    longPress: false,
  },
};

export const mobilePOSSlice = createSlice({
  name: "mobilePOS",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      // Hide cart preview when on cart tab
      if (action.payload === "cart") {
        state.showFloatingCart = false;
      } else {
        state.showFloatingCart = true;
      }
    },

    setActiveSheet: (state, action) => {
      state.activeSheet = action.payload;
    },

    toggleCartPreview: (state) => {
      state.cartPreviewExpanded = !state.cartPreviewExpanded;
    },

    setSearchFocused: (state, action) => {
      state.searchFocused = action.payload;
    },

    addToSearchHistory: (state, action) => {
      const query = action.payload;
      // Remove if already exists
      state.searchHistory = state.searchHistory.filter((q) => q !== query);
      // Add to beginning
      state.searchHistory.unshift(query);
      // Keep only last 10
      state.searchHistory = state.searchHistory.slice(0, 10);
    },

    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },

    setOfflineMode: (state, action) => {
      state.offlineMode = action.payload;
    },

    addPendingOrder: (state, action) => {
      state.pendingOrders.push({
        ...action.payload,
        timestamp: Date.now(),
        synced: false,
      });
    },

    removePendingOrder: (state, action) => {
      state.pendingOrders = state.pendingOrders.filter(
        (order) => order.timestamp !== action.payload,
      );
    },

    markOrderSynced: (state, action) => {
      const order = state.pendingOrders.find(
        (o) => o.timestamp === action.payload,
      );
      if (order) {
        order.synced = true;
      }
    },

    addRecentOrder: (state, action) => {
      // Remove if already exists
      state.recentOrders = state.recentOrders.filter(
        (o) => o._id !== action.payload._id,
      );
      // Add to beginning
      state.recentOrders.unshift(action.payload);
      // Keep only last 5
      state.recentOrders = state.recentOrders.slice(0, 5);
    },

    toggleFavoriteItem: (state, action) => {
      const itemId = action.payload;
      const index = state.favoriteItems.indexOf(itemId);
      if (index > -1) {
        state.favoriteItems.splice(index, 1);
      } else {
        state.favoriteItems.push(itemId);
      }
    },

    setShowFloatingCart: (state, action) => {
      state.showFloatingCart = action.payload;
    },

    setShowFAB: (state, action) => {
      state.showFAB = action.payload;
    },

    markHintShown: (state, action) => {
      const hintType = action.payload;
      state.hintsShown[hintType] = true;

      // If all hints shown, hide hints
      if (Object.values(state.hintsShown).every((shown) => shown)) {
        state.showSwipeHints = false;
      }
    },

    resetHints: (state) => {
      state.showSwipeHints = true;
      state.hintsShown = {
        swipeCart: false,
        swipeTabs: false,
        longPress: false,
      };
    },
  },
});

export const {
  setActiveTab,
  setActiveSheet,
  toggleCartPreview,
  setSearchFocused,
  addToSearchHistory,
  clearSearchHistory,
  setOfflineMode,
  addPendingOrder,
  removePendingOrder,
  markOrderSynced,
  addRecentOrder,
  toggleFavoriteItem,
  setShowFloatingCart,
  setShowFAB,
  markHintShown,
  resetHints,
} = mobilePOSSlice.actions;

export default mobilePOSSlice.reducer;
