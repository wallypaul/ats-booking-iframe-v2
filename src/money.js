// The backend serializes prices as Decimal strings ("66.00"), so `sum + price`
// concatenates instead of adding: 0 + "66.00" + "66.00" === "066.0066.00".
// Coerce where the API data enters the app; format where it is shown.
export const toAmount = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const formatAmount = (v) => toAmount(v).toFixed(2);
