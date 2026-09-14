import { toAmount } from './money.js';

// Mirrors the server rule (payers/deadhead/ordering.py): earliest by date, then time.
// The server decides authoritatively at submit; this only previews it.
function firstLegIndex(trips) {
  let best = null;
  trips.forEach((t, i) => {
    if (!t.date || !t.time) return;
    if (best === null || `${t.date}T${t.time}` < `${trips[best].date}T${trips[best].time}`) best = i;
  });
  return best;
}

/** The one deadhead charge for this itinerary, or null when there is none to show. */
export function deadheadFor(trips, prices) {
  const index = firstLegIndex(trips);
  const price = index === null ? 0 : toAmount(prices[index]?.deadhead_price);
  return price > 0 ? { index, miles: prices[index].deadhead_miles, price } : null;
}

export const estimateTotal = (trips, prices) =>
  prices.reduce((sum, p) => sum + toAmount(p?.price), 0) + (deadheadFor(trips, prices)?.price ?? 0);
