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
import posReducer from "../features/orders/posSlice";
import expensesReducer from "../features/expenses/expensesSlice";
import generalSettingsReducer from "../features/settings/generalSettings/generalSettingsSlice";
import kdsReducer from "../features/kds/kdsSlice";
import kdsStationsReducer from "../features/kdsStations/kdsStationsSlice";
import onboardingReducer from "../features/onboarding/onboardingSlice";
import stockAdjustmentsReducer from "../features/stockAdjustments/stockAdjustmentsSlice";
import inventoryReducer from "../features/inventory/inventorySlice";
import purchaseOrdersReducer from "../features/purchaseOrders/purchaseOrdersSlice";
import offlineMiddleware from "../utils/offline/offlineMiddleware";
import ultraFastPOSReducer from "../features/ultraFastPOS/ultraFastPOSSlice";
import addOnGroupsReducer from "../features/addOnGroups/addOnGroupsSlice";
import discountsReducer from "../features/discounts/discountsSlice";
import tablesReducer from "../features/tables/tableSlice";
import floorsReducer from "../features/floors/floorSlice";
import reservationsReducer from "../features/reservations/reservationSlice";
import analyticsGlobalReducer from "../features/analytics/slices/analyticsGlobalSlice";
import salesAnalyticsReducer from "../features/analytics/slices/salesAnalyticsSlice";
import menuAnalyticsReducer from "../features/analytics/slices/menuAnalyticsSlice";
import staffAnalyticsReducer from "../features/analytics/slices/staffAnalyticsSlice";
import customerAnalyticsReducer from "../features/analytics/slices/customerAnalyticsSlice";
import advancedAnalyticsReducer from "../features/analytics/slices/advancedAnalyticsSlice";
import paymentAnalyticsReducer from "../features/analytics/slices/paymentAnalyticsSlice";
import customReportsReducer from "../features/analytics/slices/customReportsSlice";
import inventoryAnalyticsReducer from "../features/analytics/slices/inventoryAnalyticsSlice";
import taxAnalyticsReducer from "../features/analytics/slices/taxAnalyticsSlice";
import varianceAnalyticsReducer from "../features/analytics/slices/varianceAnalyticsSlice";
import storeReducer from "../features/common/storeSlice";
import storesReducer from "../features/stores/storeSlice";
import mobilePOSReducer from "../features/orders/mobilePOSSlice";
import brandMenuReducer from "../features/brand/brandMenuSlice";
import organizationReducer from "../features/brand/organizationSlice";
import platformHealthReducer from "../features/platformHealth/platformHealthSlice";
import auditLogsReducer from "../features/auditLogs/auditLogsSlice";

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
  pos: posReducer,
  expenses: expensesReducer,
  generalSettings: generalSettingsReducer,
  kds: kdsReducer,
  kdsStations: kdsStationsReducer,
  onboarding: onboardingReducer,
  stockAdjustments: stockAdjustmentsReducer,
  inventory: inventoryReducer,
  purchaseOrders: purchaseOrdersReducer,
  ultraFastPOS: ultraFastPOSReducer,
  addOnGroups: addOnGroupsReducer,
  discounts: discountsReducer,
  floors: floorsReducer,
  tables: tablesReducer,
  reservations: reservationsReducer,
  analyticsGlobal: analyticsGlobalReducer,
  salesAnalytics: salesAnalyticsReducer,
  menuAnalytics: menuAnalyticsReducer,
  staffAnalytics: staffAnalyticsReducer,
  customerAnalytics: customerAnalyticsReducer,
  advancedAnalytics: advancedAnalyticsReducer,
  paymentAnalytics: paymentAnalyticsReducer,
  customReports: customReportsReducer,
  inventoryAnalytics: inventoryAnalyticsReducer,
  taxAnalytics: taxAnalyticsReducer,
  varianceAnalytics: varianceAnalyticsReducer,
  commonStore: storeReducer, // New Store Slice
  stores: storesReducer, // CRUD Store List
  mobilePOS: mobilePOSReducer, // Mobile POS State
  brandMenu: brandMenuReducer, // Brand Catalog Management
  organization: organizationReducer, // Brand Settings
  platformHealth: platformHealthReducer, // Platform Health Monitoring
  auditLogs: auditLogsReducer, // Audit Logs
};

export default configureStore({
  reducer: combinedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST"],
      },
    }).concat(offlineMiddleware),
});
