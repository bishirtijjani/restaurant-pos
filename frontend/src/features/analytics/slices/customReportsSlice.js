import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  savedReports: {
    data: [], // Array of { id, name, type, dateRange, metrics }
    status: "idle",
  },
  reportBuilder: {
    selectedMetrics: [],
    selectedDimensions: [],
    filters: {},
    previewData: null,
    status: "idle",
  },
};

export const customReportsSlice = createSlice({
  name: "customReports",
  initialState,
  reducers: {
    setSavedReports: (state, action) => {
      state.savedReports.data = action.payload;
      state.savedReports.status = "succeeded";
    },
    updateBuilderState: (state, action) => {
      state.reportBuilder = { ...state.reportBuilder, ...action.payload };
    },
    setReportLoading: (state) => {
      state.reportBuilder.status = "loading";
    },
  },
});

export const { setSavedReports, updateBuilderState, setReportLoading } = customReportsSlice.actions;

export const selectSavedReports = (state) => state.customReports.savedReports;
export const selectReportBuilder = (state) => state.customReports.reportBuilder;

export default customReportsSlice.reducer;
