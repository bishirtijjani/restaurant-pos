const { calculateOrderDiscounts } = require("./discountCalculator");

/**
 * OrderCalculator
 * Centralized logic for calculating order totals, taxes, and service charges.
 */
class OrderCalculator {
  /**
   * Calculate all order totals
   * @param {Object} params
   * @param {Array} params.orderItems - Processed items with price, quantity, addOnsTotal
   * @param {Object} params.settings - Effective store settings (tax, serviceCharge, etc.)
   * @param {String} params.orderType - 'dine-in', 'takeaway', etc.
   * @param {Object} params.promoCodeData - Validated promo code data (optional)
   * @param {Object} params.manualDiscount - Manual order discount (optional)
   * @param {Number} params.packagingFee - Fee amount (optional)
   * @param {Number} params.deliveryFee - Fee amount (optional)
   * @param {Number} params.tipAmount - Tip amount (optional)
   */
  static async calculateTotals({
    storeId,
    orderItems,
    settings,
    orderType = "dine-in",
    promoCodeData = null,
    manualDiscount = null,
    packagingFee = 0,
    deliveryFee = 0,
    tipAmount = 0,
  }) {
    // 1. Calculate Raw Subtotal
    const rawSubtotal = orderItems.reduce((sum, item) => {
      // Exclude voided items from calculation
      if (item.voidInfo?.isVoided || item.itemStatus === "voided") return sum;
      return (
        sum +
        (item.subtotal || item.price * item.quantity + (item.addOnsTotal || 0))
      );
    }, 0);

    const activeItems = orderItems.filter(
      (item) => !item.voidInfo?.isVoided && item.itemStatus !== "voided"
    );

    // 2. Calculate Discounts
    const discountResult = await calculateOrderDiscounts({
      storeId,
      orderItems: activeItems,
      globalDiscount: settings.globalDiscount,
      orderDiscount: manualDiscount,
      orderType,
      subtotal: rawSubtotal,
    });

    // Merge promo code if provided (assuming it was pre-validated)
    // Note: calculateOrderDiscounts handles internal discount logic,
    // but if we have a promo code that wasn't legally checked there, we might need to apply it.
    // However, the current architecture passes promo code as a discount object usually.
    // We'll respect the output of calculateOrderDiscounts.

    // 3. Calculate Taxes & Service Charge
    const taxResult = this.calculateTaxAndServiceCharge(
      discountResult.discountedSubtotal,
      activeItems,
      settings,
      orderType
    );

    // 4. Final Total
    const finalTotal =
      discountResult.discountedSubtotal +
      taxResult.totalTax +
      taxResult.serviceCharge +
      packagingFee +
      deliveryFee +
      tipAmount;

    return {
      subtotal: discountResult.discountedSubtotal, // This is technically the discounted subtotal
      rawSubtotal,
      totalTax: taxResult.totalTax,
      serviceCharge: taxResult.serviceCharge,
      itemTaxes: taxResult.itemTaxes,
      totalAmount: finalTotal,
      discountBreakdown: {
        hasDiscount: discountResult.totalDiscountAmount > 0,
        originalSubtotal: rawSubtotal,
        totalDiscountAmount: discountResult.totalDiscountAmount,
        discountedSubtotal: discountResult.discountedSubtotal,
        appliedDiscounts: discountResult.appliedDiscounts,
        itemDiscounts: discountResult.itemDiscounts,
      },
      addOnsTotal: activeItems.reduce(
        (sum, item) => sum + (item.addOnsTotal || 0),
        0
      ),
    };
  }

  static calculateTaxAndServiceCharge(
    discountedSubtotal,
    orderItems,
    settings,
    orderType
  ) {
    const { taxSettings, serviceCharge } = settings;

    let totalTax = 0;
    const itemTaxes = [];

    if (taxSettings?.enabled) {
      if (taxSettings.mode === "per-item") {
        // Per-item tax
        orderItems.forEach((item) => {
          const itemSubtotal =
            item.subtotal ||
            item.price * item.quantity + (item.addOnsTotal || 0);
          const taxRate = item.customTax?.enabled
            ? item.customTax.rate
            : taxSettings.globalRate;

          const taxAmount = (itemSubtotal * taxRate) / 100;
          totalTax += taxAmount;

          itemTaxes.push({
            menuItemId: item.menuItemId,
            name: item.name,
            taxRate,
            taxAmount,
          });
        });
      } else {
        // Per-order tax
        totalTax = (discountedSubtotal * taxSettings.globalRate) / 100;
      }
    }

    let serviceChargeAmount = 0;
    if (serviceCharge?.enabled) {
      const shouldApply =
        serviceCharge.applyTo === "all" || serviceCharge.applyTo === orderType;

      if (shouldApply) {
        serviceChargeAmount = (discountedSubtotal * serviceCharge.rate) / 100;
      }
    }

    return {
      totalTax,
      serviceCharge: serviceChargeAmount,
      itemTaxes,
    };
  }
}

module.exports = OrderCalculator;
