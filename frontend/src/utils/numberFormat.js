import store from "../app/store";

// frontend/src/utils/numberFormat.js

// Map currency code → BCP 47 locale used for digit grouping/decimal style.
// Defaults to "en-US" if no mapping; explicit entries cover the markets we
// pilot in. Add more as we expand.
const CURRENCY_LOCALE = {
  AED: "en-AE",
  GBP: "en-GB",
  EUR: "de-DE",
  NGN: "en-NG",
  USD: "en-US",
};

const resolveLocale = (currencyCode) => {
  if (!currencyCode) return "en-US";
  return CURRENCY_LOCALE[currencyCode] || "en-US";
};

export const formatCurrency = (amount, currencySymbol) => {
  // read settings synchronously from the store instead of using hooks
  const state = store.getState();
  const settings = state.generalSettings?.generalSettings;
  const symbol =
    currencySymbol ||
    settings?.currency?.symbol ||
    settings?.currencySymbol ||
    "$";
  const code = settings?.currency?.code;
  const locale = resolveLocale(code);

  if (amount === undefined || amount === null) return `${symbol}0.00`;
  const number = parseFloat(amount);
  if (isNaN(number)) return `${symbol}0.00`;
  return `${symbol}${number.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (num, decimals = 2) => {
  if (!num && num !== 0) return "0";
  const number = parseFloat(num);
  if (isNaN(number)) return "0";
  const state = store.getState();
  const code = state.generalSettings?.generalSettings?.currency?.code;
  return number.toLocaleString(resolveLocale(code), {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

export const parseFormattedNumber = (str) => {
  if (!str) return 0;
  const cleaned = str.replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned) || 0;
};
