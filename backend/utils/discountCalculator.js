// backend/utils/discountCalculator.js

/**
 * Discount Calculator Utility
 * Priority: Order-level > Item-level > Global
 *
 * Flow: Subtotal → Apply Discounts → Discounted Subtotal → Tax → Fees → Total
 */

const Discount = require("../models/Discount");
const PromoCode = require("../models/PromoCode");

/**
 * Check if a discount is currently active (date/time validation)
 */
const isDiscountActive = (discount) => {
  if (!discount.isActive) return false;

  const now = new Date();

  // Check date range
  if (discount.startDate && now < new Date(discount.startDate)) return false;
  if (discount.endDate && now > new Date(discount.endDate)) return false;

  // Check happy hour timing
  if (discount.isHappyHour && discount.happyHourConfig) {
    const { daysOfWeek, startTime, endTime } = discount.happyHourConfig;

    // Check day of week
    const currentDay = now.getDay();
    if (
      daysOfWeek &&
      daysOfWeek.length > 0 &&
      !daysOfWeek.includes(currentDay)
    ) {
      return false;
    }

    // Check time
    if (startTime && endTime) {
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
      if (currentTime < startTime || currentTime > endTime) {
        return false;
      }
    }
  }

  // Check usage limit
  if (
    discount.usageLimit !== null &&
    discount.usageCount >= discount.usageLimit
  ) {
    return false;
  }

  return true;
};

/**
 * Check if discount applies to an item
 */
const discountAppliesToItem = (discount, item) => {
  if (discount.scope === "all") return true;

  if (discount.scope === "category") {
    return discount.applicableCategories.includes(item.category);
  }

  if (discount.scope === "items") {
    const itemId = item.menuItemId?.toString() || item._id?.toString();
    return discount.applicableItems.some((id) => id.toString() === itemId);
  }

  return false;
};

/**
 * Calculate discount amount for a single value
 */
const calculateDiscountAmount = (
  originalAmount,
  discountType,
  discountValue,
  maxDiscount = null
) => {
  let discountAmount = 0;

  if (discountType === "percentage") {
    discountAmount = (originalAmount * discountValue) / 100;
  } else if (discountType === "fixed") {
    discountAmount = Math.min(discountValue, originalAmount);
  }

  // Apply maximum cap
  if (maxDiscount !== null && discountAmount > maxDiscount) {
    discountAmount = maxDiscount;
  }

  return Math.round(discountAmount * 100) / 100; // Round to 2 decimals
};

/**
 * Process BOGO discount for order items
 */
const processBOGODiscount = (orderItems, discount) => {
  const { buyQuantity, getQuantity, getDiscountPercent, applicableItems } =
    discount.bogoConfig;
  let totalBogoDiscount = 0;
  const bogoDetails = [];

  // Filter applicable items
  const eligibleItems = orderItems.filter((item) => {
    if (!applicableItems || applicableItems.length === 0) return true;
    const itemId = item.menuItemId?.toString() || item._id?.toString();
    return applicableItems.some((id) => id.toString() === itemId);
  });

  // Sort by price descending (apply discount to cheapest eligible items)
  const sortedItems = [...eligibleItems].sort((a, b) => b.price - a.price);

  // Calculate total eligible quantity
  const totalQuantity = sortedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Calculate how many "sets" we have
  const setsCount = Math.floor(totalQuantity / (buyQuantity + getQuantity));

  if (setsCount > 0) {
    // Number of items that get the discount
    const discountedItemCount = setsCount * getQuantity;
    let remainingDiscounted = discountedItemCount;

    // Apply discount to cheapest items first
    const itemsByPriceAsc = [...sortedItems].sort((a, b) => a.price - b.price);

    for (const item of itemsByPriceAsc) {
      if (remainingDiscounted <= 0) break;

      const itemsToDiscount = Math.min(remainingDiscounted, item.quantity);
      const itemDiscountAmount =
        ((item.price * getDiscountPercent) / 100) * itemsToDiscount;

      totalBogoDiscount += itemDiscountAmount;
      remainingDiscounted -= itemsToDiscount;

      bogoDetails.push({
        itemName: item.name,
        quantity: itemsToDiscount,
        discountAmount: itemDiscountAmount,
      });
    }
  }

  return {
    discountAmount: Math.round(totalBogoDiscount * 100) / 100,
    details: bogoDetails,
  };
};

/**
 * Get active happy hour discounts
 */
const getActiveHappyHourDiscounts = async (storeId) => {
  const discounts = await Discount.find({
    storeId,
    isActive: true,
    isHappyHour: true,
  });

  return discounts.filter(isDiscountActive);
};

/**
 * Validate and get promo code discount
 */
const validatePromoCode = async (
  storeId,
  code,
  orderAmount,
  orderType,
  customerId = null
) => {
  const promoCode = await PromoCode.findOne({
    storeId,
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!promoCode) {
    return { valid: false, error: "Invalid promo code" };
  }

  // Check date validity
  const now = new Date();
  if (promoCode.startDate && now < new Date(promoCode.startDate)) {
    return { valid: false, error: "Promo code is not yet active" };
  }
  if (promoCode.endDate && now > new Date(promoCode.endDate)) {
    return { valid: false, error: "Promo code has expired" };
  }

  // Check usage limit
  if (
    promoCode.usageLimit !== null &&
    promoCode.usageCount >= promoCode.usageLimit
  ) {
    return { valid: false, error: "Promo code usage limit reached" };
  }

  // Check minimum order amount
  if (orderAmount < promoCode.minimumOrderAmount) {
    return {
      valid: false,
      error: `Minimum order amount is ${promoCode.minimumOrderAmount}`,
    };
  }

  // Check order type
  if (!promoCode.applicableOrderTypes.includes(orderType)) {
    return { valid: false, error: "Promo code not valid for this order type" };
  }

  // Check per-customer usage
  if (customerId && promoCode.usageLimitPerCustomer) {
    const customerUsage = promoCode.usedBy.find(
      (u) => u.customerId?.toString() === customerId.toString()
    );
    if (
      customerUsage &&
      customerUsage.usageCount >= promoCode.usageLimitPerCustomer
    ) {
      return {
        valid: false,
        error: "You have reached the usage limit for this code",
      };
    }
  }

  // Calculate discount
  const discountAmount = calculateDiscountAmount(
    orderAmount,
    promoCode.discountType,
    promoCode.discountValue,
    promoCode.maximumDiscountAmount
  );

  return {
    valid: true,
    promoCode,
    discountAmount,
    discountType: promoCode.discountType,
    discountValue: promoCode.discountValue,
  };
};

/**
 * Main discount calculation function
 *
 * @param {Object} params
 * @param {Array} params.orderItems - Order items with price, quantity, category
 * @param {Object} params.globalDiscount - Global discount settings from GeneralSettings
 * @param {Object} params.orderDiscount - Order-level discount (manual or promo)
 * @param {String} params.orderType - dine-in, takeaway, delivery
 * @param {Number} params.subtotal - Order subtotal before discounts
 */
const calculateOrderDiscounts = async ({
  storeId,
  orderItems,
  globalDiscount,
  orderDiscount,
  orderType,
  subtotal,
}) => {
  const result = {
    originalSubtotal: subtotal,
    itemDiscounts: [],
    orderDiscountAmount: 0,
    globalDiscountAmount: 0,
    happyHourDiscountAmount: 0,
    bogoDiscountAmount: 0,
    totalDiscountAmount: 0,
    discountedSubtotal: subtotal,
    appliedDiscounts: [],
  };

  let runningSubtotal = subtotal;

  // 1. Check for active Happy Hour discounts (automatic)
  const happyHourDiscounts = await getActiveHappyHourDiscounts(storeId);
  for (const hhDiscount of happyHourDiscounts) {
    if (hhDiscount.applicableOrderTypes.includes(orderType)) {
      if (hhDiscount.type === "bogo") {
        const bogoResult = processBOGODiscount(orderItems, hhDiscount);
        result.bogoDiscountAmount += bogoResult.discountAmount;
        result.appliedDiscounts.push({
          name: hhDiscount.name,
          type: "happy_hour_bogo",
          amount: bogoResult.discountAmount,
          details: bogoResult.details,
        });
      } else {
        const hhAmount = calculateDiscountAmount(
          runningSubtotal,
          hhDiscount.type,
          hhDiscount.value,
          hhDiscount.maximumDiscountAmount
        );
        result.happyHourDiscountAmount += hhAmount;
        result.appliedDiscounts.push({
          name: hhDiscount.name,
          type: "happy_hour",
          discountType: hhDiscount.type,
          discountValue: hhDiscount.value,
          amount: hhAmount,
        });
      }
    }
  }

  // Apply happy hour discount to running total
  runningSubtotal -= result.happyHourDiscountAmount + result.bogoDiscountAmount;

  // 2. Apply Order-level discount (highest priority - overrides item/global)
  if (orderDiscount && orderDiscount.enabled) {
    const orderDiscAmount = calculateDiscountAmount(
      runningSubtotal,
      orderDiscount.type,
      orderDiscount.value,
      orderDiscount.maxDiscount
    );

    result.orderDiscountAmount = orderDiscAmount;
    result.appliedDiscounts.push({
      name: orderDiscount.name || "Order Discount",
      type: "order",
      discountType: orderDiscount.type,
      discountValue: orderDiscount.value,
      amount: orderDiscAmount,
      promoCode: orderDiscount.promoCode || null,
    });

    runningSubtotal -= orderDiscAmount;
  }

  // 3. Check item-level discounts if no order discount OR if order discount is stackable
  const shouldCheckOtherDiscounts =
    !orderDiscount || !orderDiscount.enabled || orderDiscount.stackable;

  if (shouldCheckOtherDiscounts) {
    // 3. Apply item-level discounts
    let totalItemDiscount = 0;
    for (const item of orderItems) {
      if (item.discount && item.discount.enabled) {
        const itemTotal =
          (item.price + (item.addOnsTotal || 0)) * item.quantity;
        const itemDiscAmount = calculateDiscountAmount(
          itemTotal,
          item.discount.type,
          item.discount.value,
          item.discount.maxDiscount
        );

        totalItemDiscount += itemDiscAmount;
        result.itemDiscounts.push({
          menuItemId: item.menuItemId,
          name: item.name,
          discountType: item.discount.type,
          discountValue: item.discount.value,
          amount: itemDiscAmount,
        });
      }
    }

    if (totalItemDiscount > 0) {
      result.appliedDiscounts.push({
        name: "Item Discounts",
        type: "item",
        amount: totalItemDiscount,
        details: result.itemDiscounts,
      });
      runningSubtotal -= totalItemDiscount;
    } else if (globalDiscount && globalDiscount.enabled) {
      // 4. If no item discounts, apply global discount
      if (
        globalDiscount.applicableOrderTypes?.includes(orderType) ||
        !globalDiscount.applicableOrderTypes
      ) {
        const globalAmount = calculateDiscountAmount(
          runningSubtotal,
          globalDiscount.type,
          globalDiscount.value,
          globalDiscount.maxDiscount
        );

        result.globalDiscountAmount = globalAmount;
        result.appliedDiscounts.push({
          name: globalDiscount.name || "Store Discount",
          type: "global",
          discountType: globalDiscount.type,
          discountValue: globalDiscount.value,
          amount: globalAmount,
        });

        runningSubtotal -= globalAmount;
      }
    }
  }

  // Calculate totals
  result.totalDiscountAmount =
    result.happyHourDiscountAmount +
    result.bogoDiscountAmount +
    result.orderDiscountAmount +
    result.itemDiscounts.reduce((sum, d) => sum + d.amount, 0) +
    result.globalDiscountAmount;

  result.discountedSubtotal = Math.max(
    0,
    subtotal - result.totalDiscountAmount
  );

  return result;
};

/**
 * Increment promo code usage
 */
const incrementPromoCodeUsage = async (
  code,
  storeId,
  customerId = null,
  session = null
) => {
  const update = {
    $inc: { usageCount: 1 },
  };

  if (customerId) {
    // Update or add customer usage tracking
    await PromoCode.findOneAndUpdate(
      {
        code: code.toUpperCase(),
        storeId,
        "usedBy.customerId": customerId,
      },
      {
        $inc: { usageCount: 1, "usedBy.$.usageCount": 1 },
        $set: { "usedBy.$.lastUsed": new Date() },
      },
      { session }
    ).then(async (doc) => {
      if (!doc) {
        // Customer not in usedBy array, add them
        await PromoCode.findOneAndUpdate(
          { code: code.toUpperCase(), storeId },
          {
            $inc: { usageCount: 1 },
            $push: {
              usedBy: {
                customerId,
                usageCount: 1,
                lastUsed: new Date(),
              },
            },
          },
          { session }
        );
      }
    });
  } else {
    await PromoCode.findOneAndUpdate(
      { code: code.toUpperCase(), storeId },
      update,
      {
        session,
      }
    );
  }
};

/**
 * Increment discount usage count
 */
const incrementDiscountUsage = async (discountId) => {
  await Discount.findByIdAndUpdate(discountId, { $inc: { usageCount: 1 } });
};

module.exports = {
  isDiscountActive,
  discountAppliesToItem,
  calculateDiscountAmount,
  processBOGODiscount,
  getActiveHappyHourDiscounts,
  validatePromoCode,
  calculateOrderDiscounts,
  incrementPromoCodeUsage,
  incrementDiscountUsage,
};
