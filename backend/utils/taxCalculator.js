// Tax calculation utility
const calculateOrderTax = (orderItems, settings, orderType) => {
  const { taxSettings, serviceCharge } = settings;

  let subtotal = 0;
  let totalTax = 0;
  const itemTaxes = [];

  // Calculate per-item taxes
  orderItems.forEach((item) => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    if (taxSettings.enabled) {
      const taxRate = item.customTax?.enabled
        ? item.customTax.rate
        : taxSettings.globalRate;

      const taxAmount =
        taxSettings.mode === "per-item" ? (itemSubtotal * taxRate) / 100 : 0;

      totalTax += taxAmount;

      itemTaxes.push({
        menuItemId: item.menuItemId,
        name: item.name,
        taxRate,
        taxAmount,
      });
    }
  });

  // Per-order tax calculation
  if (taxSettings.enabled && taxSettings.mode === "per-order") {
    totalTax = (subtotal * taxSettings.globalRate) / 100;
  }

  // Service charge calculation
  let serviceChargeAmount = 0;
  if (serviceCharge.enabled) {
    const shouldApply =
      serviceCharge.applyTo === "all" || serviceCharge.applyTo === orderType;

    if (shouldApply) {
      serviceChargeAmount = (subtotal * serviceCharge.rate) / 100;
    }
  }

  return {
    subtotal,
    totalTax,
    serviceCharge: serviceChargeAmount,
    total: subtotal + totalTax + serviceChargeAmount,
    itemTaxes,
  };
};

module.exports = { calculateOrderTax };
