import store from "../app/store";

// frontend/src/utils/numberFormat.js
export const formatCurrency = (amount, currencySymbol) => {
  // read settings synchronously from the store instead of using hooks
  const state = store.getState();
  const settings = state.generalSettings?.generalSettings;
  const symbol =
    currencySymbol ||
    settings?.currency?.symbol ||
    settings?.currencySymbol ||
    "$";

  if (amount === undefined || amount === null) return `${symbol}0.00`;
  const number = parseFloat(amount);
  if (isNaN(number)) return `${symbol}0.00`;
  return `${symbol}${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (num, decimals = 2) => {
  if (!num && num !== 0) return "0";
  const number = parseFloat(num);
  if (isNaN(number)) return "0";
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

export const parseFormattedNumber = (str) => {
  if (!str) return 0;
  const cleaned = str.replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned) || 0;
};
