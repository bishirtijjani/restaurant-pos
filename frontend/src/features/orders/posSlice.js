import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  orderType: "dine-in", // dine-in, takeaway, delivery, walk-in
  selectedTable: null,
  customerDetails: {
    customerId: null,
    name: "",
    phone: "",
    address: "",
  },
  orderNote: "",
  orderDiscount: null,
  packagingFee: "0",
  deliveryFee: "0",
  searchQuery: "",
  activeCategory: "All",
};

export const posSlice = createSlice({
  name: "pos",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { item, addOnData } = action.payload;
      const newItem = { ...item };

      // Calculate add-ons total
      const addOnsTotal = addOnData.total - item.price;

      const cartItem = {
        ...newItem,
        quantity: 1,
        addOns: addOnData.addOns,
        itemNote: addOnData.itemNote,
        addOnsTotal: addOnsTotal,
        cartId: Date.now(), // Unique ID for cart item
      };

      // Check if identical item exists
      const cartKey = JSON.stringify({
        id: cartItem._id,
        addOns: cartItem.addOns.map((a) => ({
          groupId: a.groupId,
          items: a.selectedItemIds?.sort(),
        })),
        note: cartItem.itemNote,
      });

      const existingIndex = state.cart.findIndex((c) => {
        const itemKey = JSON.stringify({
          id: c._id,
          addOns: (c.addOns || []).map((a) => ({
            groupId: a.groupId,
            items: a.selectedItemIds?.sort(),
          })),
          note: c.itemNote,
        });
        return itemKey === cartKey;
      });

      if (existingIndex >= 0) {
        state.cart[existingIndex].quantity += 1;
      } else {
        state.cart.push(cartItem);
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((_, index) => index !== action.payload);
    },
    updateCartItemQuantity: (state, action) => {
      const { index, quantity } = action.payload;
      if (quantity <= 0) {
        state.cart = state.cart.filter((_, i) => i !== index);
      } else {
        state.cart[index].quantity = quantity;
      }
    },
    updateCartItemNote: (state, action) => {
      const { index, note } = action.payload;
      state.cart[index].itemNote = note;
    },
    updateCartItem: (state, action) => {
      const { index, item, addOnData } = action.payload;
      const oldItem = state.cart[index];
      const addOnsTotal = addOnData.total - item.price;

      state.cart[index] = {
        ...oldItem,
        addOns: addOnData.addOns,
        itemNote: addOnData.itemNote,
        addOnsTotal: addOnsTotal,
        price: item.price, // ensure price is consistent
      };
    },
    clearCart: (state) => {
      state.cart = [];
      state.orderNote = "";
      state.orderDiscount = null;
      state.packagingFee = "0";
      state.deliveryFee = "0";
      // We might want to keep table/orderType/customer depending on workflow,
      // but usually clearCart implies a fresh start.
      // Keeping selectedTable if it's dine-in could be useful, but let's reset for safety.
      state.selectedTable = null;
      state.customerDetails = {
        customerId: null,
        name: "",
        phone: "",
        address: "",
      };
      state.orderType = "dine-in";
    },
    setOrderType: (state, action) => {
      state.orderType = action.payload;
    },
    setSelectedTable: (state, action) => {
      state.selectedTable = action.payload;
    },
    setCustomerDetails: (state, action) => {
      state.customerDetails = action.payload;
    },
    updateCustomerDetails: (state, action) => {
      state.customerDetails = { ...state.customerDetails, ...action.payload };
    },
    setOrderNote: (state, action) => {
      state.orderNote = action.payload;
    },
    setOrderDiscount: (state, action) => {
      state.orderDiscount = action.payload;
    },
    setPackagingFee: (state, action) => {
      state.packagingFee = action.payload;
    },
    setDeliveryFee: (state, action) => {
      state.deliveryFee = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  updateCartItemNote,
  updateCartItem,
  clearCart,
  setOrderType,
  setSelectedTable,
  setCustomerDetails,
  updateCustomerDetails,
  setOrderNote,
  setOrderDiscount,
  setPackagingFee,
  setDeliveryFee,
  setSearchQuery,
  setActiveCategory,
} = posSlice.actions;

export default posSlice.reducer;
