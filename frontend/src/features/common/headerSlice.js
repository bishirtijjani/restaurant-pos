import { createSlice } from "@reduxjs/toolkit";

export const headerSlice = createSlice({
  name: "header",
  initialState: {
    pageTitle: "Home",
    noOfNotifications: 0, // Initialize with a default value
    newNotificationMessage: "",
    newNotificationStatus: 1,
  },
  reducers: {
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload.title;
    },
    removeNotificationMessage: (state, action) => {
      state.newNotificationMessage = "";
    },
    showNotification: (state, action) => {
      state.newNotificationMessage = action.payload.message;
      state.newNotificationStatus = action.payload.status;
    },
    updateNotificationsCount: (state, action) => {
      state.noOfNotifications = action.payload; // Update the count when needed
    },
  },
});

export const {
  setPageTitle,
  removeNotificationMessage,
  showNotification,
  updateNotificationsCount,
} = headerSlice.actions;

export default headerSlice.reducer;
