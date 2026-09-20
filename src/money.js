// The backend serializes prices as Decimal strings ("66.00"), so `sum + price`
// concatenates instead of adding: 0 + "66.00" + "66.00" === "066.0066.00".
// Coerce where the API data enters the app; format where it is shown.
export const toAmount = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Sum two-decimal money or mileage without binary float dust.
 *
 * Every figure the API sends is already 2dp, but adding them as floats is not:
 * 14.80 + 42.90 === 57.699999999999996. Left alone that renders in full on a
 * booking confirmation, which is how a client stops trusting the number.
 */
export const round2 = (n) => Math.round(toAmount(n) * 100) / 100;

export const formatAmount = (v) => toAmount(v).toFixed(2);

/**
 * A server-sent figure when it is there, a locally derived one when it is not.
 *
 * The distinction is present-vs-absent, NOT truthiness: a real `0` is an answer
 * ("no deadhead on this booking") and must not be replaced. An earlier version
 * of the confirmation asked only "did an itinerary come back?" and then trusted
 * every key on it, so a backend without `legs_miles` rendered "Trip mileage
 * 0.00 mi" next to a correct total.
 */
export const preferred = (value, derive) =>
  value === undefined || value === null ? derive() : toAmount(value);
