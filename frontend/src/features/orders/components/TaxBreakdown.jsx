import React from "react";
import {
  ReceiptPercentIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const TaxBreakdown = ({ taxBreakdown, settings }) => {
  if (!taxBreakdown) return null;

  const { subtotal, totalTax, serviceCharge, items } = taxBreakdown;
  const total = subtotal + totalTax + serviceCharge;

  const formatCurrency = (amount) =>
    `₦${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="space-y-3">
      {/* Subtotal */}
      <div className="flex justify-between text-base-content/80">
        <span>Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>

      {/* Tax Breakdown */}
      {totalTax > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ReceiptPercentIcon className="w-4 h-4" />
              <span>{settings?.taxSettings?.name || "Tax"}</span>
            </div>
            <span className="font-medium">{formatCurrency(totalTax)}</span>
          </div>

          {/* Per-item tax details (collapsible on mobile) */}
          {settings?.taxSettings?.mode === "per-item" && items?.length > 0 && (
            <details className="collapse collapse-arrow bg-base-200 rounded-lg">
              <summary className="collapse-title text-xs font-medium min-h-0 py-2">
                View item-wise tax
              </summary>
              <div className="collapse-content text-xs space-y-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between opacity-70">
                    <span>
                      {item.name} ({item.taxRate}%)
                    </span>
                    <span>{formatCurrency(item.taxAmount)}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Service Charge */}
      {serviceCharge > 0 && (
        <div className="flex justify-between text-base-content/80">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4" />
            <span>{settings?.serviceCharge?.name || "Service Charge"}</span>
          </div>
          <span className="font-medium">{formatCurrency(serviceCharge)}</span>
        </div>
      )}

      <div className="divider my-2"></div>

      {/* Total */}
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span className="text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default TaxBreakdown;
