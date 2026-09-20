// Deadhead is a booking-level charge covering both empty runs — out of the base
// to the first pickup and home from the last drop-off — shown as its own line,
// never inside a leg's price. Run: node src/deadhead.check.mjs
import assert from 'node:assert/strict';
import { deadheadFor, estimateTotal } from './deadhead.js';

// Three legs on three different DAYS, so each pays its own way out and home.
const trips = [
  { date: '2026-09-16', time: '09:00' },   // A
  { date: '2026-09-15', time: '14:30' },   // B
  { date: '2026-09-17', time: '08:00' },   // C
];
const prices = trips.map(() => ({
  price: 37.5,
  deadhead_miles: '4', deadhead_price: '8.00',
  return_deadhead_miles: '5', return_deadhead_price: '10.00',
}));

// 3 days * (4 + 5) mi and * (8 + 10).
assert.deepEqual(deadheadFor(trips, prices), { index: 0, miles: 27, price: 54 });
assert.equal(estimateTotal(trips, prices), 166.5, '3 legs + 3 days of deadhead');

// Two legs on ONE day pay one run out and one run home between them, not two of
// each — the van left the base once that morning.
const sameDay = [{ date: '2026-09-15', time: '16:00' }, { date: '2026-09-15', time: '06:00' }];
assert.deepEqual(deadheadFor(sameDay, prices), { index: 1, miles: 9, price: 18 });
assert.equal(deadheadFor(sameDay, prices).index, 1, '06:00 is that day\'s first');

// A single leg is its day's first and last: it pays out AND back.
const one = [{ date: '2026-09-15', time: '09:00' }];
assert.deepEqual(deadheadFor(one, prices), { index: 0, miles: 9, price: 18 });
assert.equal(estimateTotal(one, [prices[0]]), 55.5, 'one leg + out + back');

// The reported bug: an out-and-back across two days. Charging only the
// itinerary's overall first and last leg would give 2 runs; there are 4.
const twoDays = [{ date: '2026-09-16', time: '01:35' }, { date: '2026-09-17', time: '01:35' }];
assert.equal(deadheadFor(twoDays, prices).price, 36, 'two days = four runs');

// Inside the free allowance (or no base) → zero → no row at all.
const noBase = prices.map((p) => ({ ...p, deadhead_price: '0', return_deadhead_price: '0' }));
assert.equal(deadheadFor(trips, noBase), null);
assert.equal(estimateTotal(trips, noBase), 112.5);

// Only one direction charged (the way home is inside the allowance).
const outOnly = prices.map((p) => ({ ...p, return_deadhead_price: '0', return_deadhead_miles: '0' }));
assert.deepEqual(deadheadFor(trips, outOnly), { index: 0, miles: 12, price: 24 });

// Float dust: 14.80 + 42.90 is 57.699999999999996 in binary floating point, and
// that whole string once rendered on a booking confirmation. Both figures come
// from the server already at 2dp, so the sum must be too.
const dusty = [{
  price: '37.50',
  deadhead_miles: '14.80', deadhead_price: '14.80',
  return_deadhead_miles: '42.90', return_deadhead_price: '42.90',
}];
assert.deepEqual(deadheadFor(one, dusty), { index: 0, miles: 57.7, price: 57.7 });
assert.equal(String(deadheadFor(one, dusty).miles), '57.7', 'no 57.699999999999996');
assert.equal(estimateTotal(one, dusty), 95.2, '37.50 + 57.70');

// An older backend without the fields → no row, legs only.
assert.equal(deadheadFor(trips, [{ price: 1 }, { price: 2 }, { price: 3 }]), null);
assert.equal(estimateTotal([], []), 0);

console.log('iframe deadhead OK');
