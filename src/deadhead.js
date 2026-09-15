import { toAmount } from './money.js';

// Mirrors the server rule (payers/deadhead/ordering.py): earliest by date then
// time pays the run OUT of the base, latest pays the run HOME from the last
// drop-off. The server decides authoritatively at submit; this only previews it.
function legIndex(trips, pick) {
  let best = null;
  trips.forEach((t, i) => {
    if (!t.date || !t.time) return;
    if (best === null || pick(`${t.date}T${t.time}`, `${trips[best].date}T${trips[best].time}`)) {
      best = i;
    }
  });
  return best;
}

const firstLegIndex = (trips) => legIndex(trips, (when, best) => when < best);
const lastLegIndex = (trips) => legIndex(trips, (when, best) => when > best);

/**
 * The deadhead charge for this itinerary, or null when there is none to show.
 *
 * One figure covering both empty runs — out to the first pickup and home from
 * the last drop-off. They are the same charge at the same rate, and showing a
 * rider two deadhead lines reads as being billed twice.
 */
export function deadheadFor(trips, prices) {
  const out = firstLegIndex(trips);
  const back = lastLegIndex(trips);
  const outPrice = out === null ? 0 : toAmount(prices[out]?.deadhead_price);
  const backPrice = back === null ? 0 : toAmount(prices[back]?.return_deadhead_price);
  const price = outPrice + backPrice;
  if (price <= 0) return null;
  const miles =
    (out === null ? 0 : toAmount(prices[out]?.deadhead_miles)) +
    (back === null ? 0 : toAmount(prices[back]?.return_deadhead_miles));
  return { index: out ?? back, miles, price };
}

export const estimateTotal = (trips, prices) =>
  prices.reduce((sum, p) => sum + toAmount(p?.price), 0) + (deadheadFor(trips, prices)?.price ?? 0);
