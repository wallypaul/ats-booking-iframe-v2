import { round2, toAmount } from './money.js';

/**
 * `{date: [firstIndex, lastIndex]}` — the two legs that pay deadhead on each day.
 *
 * Mirrors the server rule (payers/deadhead/ordering.py). Deadhead is charged PER
 * DAY, because that is what the van does: out of the base each morning, home
 * each evening. An itinerary running Wednesday and Thursday makes four empty
 * runs, and the two in the middle — Wednesday's drive home and Thursday's drive
 * out — are usually the long ones, since the day ends wherever the member was
 * dropped rather than next door to the base.
 *
 * A day with one leg maps it to both: driven out to, driven home from.
 * The server decides authoritatively at submit; this only previews it.
 */
function legsByDay(trips) {
  const days = new Map();
  trips.forEach((t, i) => {
    if (!t.date || !t.time) return;
    const day = days.get(t.date);
    if (!day) {
      days.set(t.date, [i, i]);
      return;
    }
    if (t.time < trips[day[0]].time) day[0] = i;
    if (t.time > trips[day[1]].time) day[1] = i;
  });
  return days;
}

/**
 * The deadhead charge for this itinerary, or null when there is none to show.
 *
 * ONE figure covering every empty run the booking makes — each day's drive out
 * and drive home. They are the same charge at the same rate, and showing a rider
 * a separate line per run reads as being billed over and over.
 *
 * `index` is the first leg that carries any of it, for the "Trip N" reference.
 */
export function deadheadFor(trips, prices) {
  let price = 0;
  let miles = 0;
  let index = null;
  for (const [out, back] of legsByDay(trips).values()) {
    const outPrice = toAmount(prices[out]?.deadhead_price);
    const backPrice = toAmount(prices[back]?.return_deadhead_price);
    if (index === null && (outPrice > 0 || backPrice > 0)) index = outPrice > 0 ? out : back;
    price += outPrice + backPrice;
    miles += toAmount(prices[out]?.deadhead_miles)
      + toAmount(prices[back]?.return_deadhead_miles);
  }
  if (price <= 0) return null;
  // Rounded, not raw: adding two-decimal figures as binary floats gives
  // 14.80 + 42.90 === 57.699999999999996, and that lands verbatim on a booking
  // confirmation. Every operand is already 2dp, so rounding here loses nothing.
  return { index, miles: round2(miles), price: round2(price) };
}

export const estimateTotal = (trips, prices) =>
  round2(
    prices.reduce((sum, p) => sum + toAmount(p?.price), 0)
    + (deadheadFor(trips, prices)?.price ?? 0),
  );
