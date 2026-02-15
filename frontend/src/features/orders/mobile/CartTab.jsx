// frontend/src/features/orders/mobile/CartTab.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trash2,
  Edit3,
  Plus,
  Minus,
  StickyNote,
  ShoppingCart,
} from "lucide-react";
import { useHaptic } from "../../../hooks/useHaptic";
import {
  removeFromCart,
  updateCartItemQuantity,
  updateCartItemNote,
  updateCartItem,
  clearCart,
  setOrderNote,
} from "../posSlice";
import { setActiveTab } from "../mobilePOSSlice";
import { openModal } from "../../common/modalSlice";
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
} from "../../../utils/globalConstantUtil";

/**
 * Cart Tab - Mobile optimized cart management
 * Features: Swipeable items, inline editing, order summary
 */
const CartTab = () => {
  const dispatch = useDispatch();
  const haptic = useHaptic();

  // Redux state
  const { cart, orderNote } = useSelector((state) => state.pos);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings,
  );
  const currency = settings?.currency?.symbol || "$";

  // Local state for editing notes use existing...
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price + (item.addOnsTotal || 0)) * item.quantity,
    0,
  );

  // Handle quantity change
  const handleQuantityChange = (index, newQuantity) => {
    haptic.light();
    dispatch(updateCartItemQuantity({ index, quantity: newQuantity }));
  };

  // Handle item delete
  const handleDelete = (index) => {
    haptic.medium();
    dispatch(removeFromCart(index));
  };

  const handleEdit = (index) => {
    haptic.light();
    const item = cart[index];

    // Transform cart add-ons back to selection map for the standard modal
    const selections = {};
    item.addOns?.forEach((group) => {
      if (group.selectedItemIds) {
        selections[group.groupId] = group.selectedItemIds;
      }
    });

    dispatch(
      openModal({
        title: `Edit ${item.name}`,
        bodyType: MODAL_BODY_TYPES.ADD_ON_SELECTOR,
        extraObject: {
          menuItem: item,
          initialSelections: selections,
          initialNote: item.itemNote,
          onConfirm: (addOnData) => {
            dispatch(
              updateCartItem({
                index,
                item,
                addOnData,
              }),
            );
          },
        },
        size: "lg",
      }),
    );
  };

  // Handle note edit
  const handleStartEditNote = (index, currentNote) => {
    setEditingNoteIndex(index);
    setNoteText(currentNote || "");
  };

  const handleSaveNote = (index) => {
    dispatch(updateCartItemNote({ index, note: noteText }));
    setEditingNoteIndex(null);
    setNoteText("");
  };

  const handleCancelEditNote = () => {
    setEditingNoteIndex(null);
    setNoteText("");
  };

  // Handle clear cart
  const handleClearCart = () => {
    dispatch(
      openModal({
        title: "Clear Cart?",
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: "Are you sure you want to clear the entire cart?",
          type: CONFIRMATION_MODAL_CLOSE_TYPES.CLEAR_CART,
          onConfirm: () => {
            haptic.success();
            dispatch(clearCart());
          },
        },
      }),
    );
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    haptic.medium();
    dispatch(setActiveTab("payment"));
  };

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-base-200 p-8">
        <ShoppingCart size={80} className="text-base-content/20 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-base-content/60 text-center mb-6">
          Add items from the menu to get started
        </p>
        <button
          onClick={() => dispatch(setActiveTab("menu"))}
          className="btn btn-primary"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-base-200">
      {/* Header */}
      <div className="bg-base-100 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Cart</h2>
          <p className="text-sm text-base-content/60">
            {cart.length} {cart.length === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          onClick={handleClearCart}
          className="btn btn-ghost btn-sm gap-2 text-error"
        >
          <Trash2 size={16} />
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item, index) => (
          <div
            key={item.cartId || index}
            className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200"
          >
            {/* Item Header & Actions */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate text-base">
                  {item.name}
                </h3>
                <p className="text-xs text-base-content/70 mt-0.5">
                  {currency}
                  {item.price.toFixed(2)}
                  {item.addOnsTotal > 0 && (
                    <span className="text-success font-medium">
                      {" "}
                      +{currency}
                      {item.addOnsTotal.toFixed(2)}
                    </span>
                  )}
                </p>

                {/* Add-ons List */}
                {item.addOnSummary?.length > 0 && (
                  <div className="mt-1 text-[10px] text-base-content/50 leading-tight">
                    {item.addOnSummary.join(", ")}
                  </div>
                )}
              </div>

              {/* Action Buttons & Total */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(index)}
                    className="btn btn-ghost btn-xs h-7 min-h-7 px-2 gap-1 text-info hover:bg-info/10"
                  >
                    <Edit3 size={12} />
                    <span className="text-[10px] font-bold uppercase">
                      Edit
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="btn btn-ghost btn-xs h-7 min-h-7 px-2 gap-1 text-error hover:bg-error/10"
                  >
                    <Trash2 size={12} />
                    <span className="text-[10px] font-bold uppercase">
                      Delete
                    </span>
                  </button>
                </div>
                <div className="text-lg font-bold text-primary tabular-nums">
                  {currency}
                  {(
                    (item.price + (item.addOnsTotal || 0)) *
                    item.quantity
                  ).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(index, item.quantity - 1)}
                  className="btn btn-circle btn-sm btn-outline"
                  disabled={item.quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-semibold min-w-[2rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(index, item.quantity + 1)}
                  className="btn btn-circle btn-sm btn-primary"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Note Button */}
              {editingNoteIndex === index ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveNote(index)}
                    className="btn btn-sm btn-success"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEditNote}
                    className="btn btn-sm btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleStartEditNote(index, item.itemNote)}
                  className="btn btn-sm btn-ghost gap-2"
                >
                  <StickyNote size={16} />
                  {item.itemNote ? "Edit Note" : "Add Note"}
                </button>
              )}
            </div>

            {/* Note Input/Display */}
            {editingNoteIndex === index ? (
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveNote(index)}
                placeholder="Add special instructions..."
                className="input input-bordered input-sm w-full mt-3"
                autoFocus
              />
            ) : (
              item.itemNote && (
                <div className="mt-3 p-2 bg-warning/10 rounded-lg">
                  <p className="text-sm italic text-warning-content">
                    Note: {item.itemNote}
                  </p>
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {/* Order Note */}
      <div className="bg-base-100 p-4 border-t border-base-300">
        <textarea
          value={orderNote}
          onChange={(e) => dispatch(setOrderNote(e.target.value))}
          placeholder="Order note (allergies, special requests...)"
          className="textarea textarea-bordered w-full"
          rows="2"
        />
      </div>

      {/* Summary & Actions */}
      <div className="bg-base-100 p-4 border-t-2 border-base-300 shadow-lg">
        {/* Subtotal */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Subtotal</span>
          <span className="text-2xl font-bold text-primary">
            {currency}
            {subtotal.toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => dispatch(setActiveTab("menu"))}
            className="btn btn-outline flex-1"
          >
            Add More Items
          </button>
          <button
            onClick={handleProceedToPayment}
            className="btn btn-primary flex-1 gap-2"
          >
            Proceed to Payment
            <span className="badge badge-sm">
              {currency}
              {subtotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartTab;
