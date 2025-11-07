import { configureStore } from "@reduxjs/toolkit";
import headerReducer from "../features/common/headerSlice";
import modalReducer from "../features/common/modalSlice";
import rightDrawerReducer from "../features/common/rightDrawerSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import authReducer from "./authSlice";
import usersReducer from "../features/users/usersSlice";
import customersReducer from "../features/customers/customersSlice";
import menuItemsReducer from "../features/menuItems/menuItemsSlice";
import categoriesReducer from "../features/categories/categoriesSlice";
import suppliersReducer from "../features/suppliers/suppliersSlice";
import ordersReducer from "../features/orders/ordersSlice";
import expensesReducer from "../features/expenses/expensesSlice";
import analyticsReducer from "../features/analytics/analyticsSlice";
import generalSettingsReducer from "../features/settings/generalSettings/generalSettingsSlice";
import kdsReducer from "../features/kds/kdsSlice";
import kdsStationsReducer from "../features/kdsStations/kdsStationsSlice";
import onboardingReducer from "../features/onboarding/onboardingSlice";
import stockAdjustmentsReducer from "../features/stockAdjustments/stockAdjustmentsSlice";
import inventoryReducer from "../features/inventory/inventorySlice";
import purchaseOrdersReducer from "../features/purchaseOrders/purchaseOrdersSlice";

const combinedReducer = {
  header: headerReducer,
  rightDrawer: rightDrawerReducer,
  modal: modalReducer,
  dashboard: dashboardReducer,
  auth: authReducer,
  users: usersReducer,
  customers: customersReducer,
  menuItems: menuItemsReducer,
  categories: categoriesReducer,
  suppliers: suppliersReducer,
  orders: ordersReducer,
  expenses: expensesReducer,
  analytics: analyticsReducer,
  generalSettings: generalSettingsReducer,
  kds: kdsReducer,
  kdsStations: kdsStationsReducer,
  onboarding: onboardingReducer,
  stockAdjustments: stockAdjustmentsReducer,
  inventory: inventoryReducer,
  purchaseOrders: purchaseOrdersReducer,
};

export default configureStore({
  reducer: combinedReducer,
});
