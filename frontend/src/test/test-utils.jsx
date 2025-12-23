import React from "react";
import { render } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

// Import your reducers here (or just import the combined reducer object if exported)
// For simplicity in tests, we can just import the specific reducers we need or use the whole list
import headerReducer from "../features/common/headerSlice";
import authReducer from "../app/authSlice";
import storeReducer from "../features/common/storeSlice";
import modalReducer from "../features/common/modalSlice";
import posReducer from "../features/orders/posSlice";
import menuItemsReducer from "../features/menuItems/menuItemsSlice";
import categoriesReducer from "../features/categories/categoriesSlice";
import generalSettingsReducer from "../features/settings/generalSettings/generalSettingsSlice";
import tablesReducer from "../features/tables/tableSlice";
import ordersReducer from "../features/orders/ordersSlice";
import rightDrawerReducer from "../features/common/rightDrawerSlice";

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore({
      reducer: {
        header: headerReducer,
        auth: authReducer,
        commonStore: storeReducer,
        modal: modalReducer,
        pos: posReducer,
        menuItems: menuItemsReducer,
        categories: categoriesReducer,
        generalSettings: generalSettingsReducer,
        tables: tablesReducer,
        orders: ordersReducer,
        rightDrawer: rightDrawerReducer,
      },
      preloadedState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    );
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
