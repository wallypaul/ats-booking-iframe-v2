// Deadhead is a booking-level charge covering both empty runs — out of the base
// to the first pickup and home from the last drop-off — shown as its own line,
// never inside a leg's price. Run: node src/deadhead.check.mjs
import assert from 'node:assert/strict';
import { deadheadFor, estimateTotal } from './deadhead.js';

const trips = [
  { date: '2026-09-16', time: '09:00' },   // A
  { date: '2026-09-15', time: '14:30' },   // B — earliest, pays the run out
  { date: '2026-09-17', time: '08:00' },   // C — latest, pays the run home
];
const prices = trips.map(() => ({
  price: 37.5,
  deadhead_miles: '4', deadhead_price: '8.00',
  return_deadhead_miles: '5', return_deadhead_price: '10.00',
}));

assert.deepEqual(deadheadFor(trips, prices), { index: 1, miles: 9, price: 18 });
assert.equal(estimateTotal(trips, prices), 130.5, '3 legs + out + back');

// Same day: time decides which leg is first and which is last.
const sameDay = [{ date: '2026-09-15', time: '16:00' }, { date: '2026-09-15', time: '06:00' }];
assert.equal(deadheadFor(sameDay, prices).index, 1);

// A single leg is both the first and the last: it pays out AND back.
const one = [{ date: '2026-09-15', time: '09:00' }];
assert.deepEqual(deadheadFor(one, prices), { index: 0, miles: 9, price: 18 });
assert.equal(estimateTotal(one, [prices[0]]), 55.5, 'one leg + out + back');

// Inside the free allowance (or no base) → zero → no row at all.
const noBase = prices.map((p) => ({ ...p, deadhead_price: '0', return_deadhead_price: '0' }));
assert.equal(deadheadFor(trips, noBase), null);
assert.equal(estimateTotal(trips, noBase), 112.5);

// Only one direction charged (the way home is inside the allowance).
const outOnly = prices.map((p) => ({ ...p, return_deadhead_price: '0', return_deadhead_miles: '0' }));
assert.deepEqual(deadheadFor(trips, outOnly), { index: 1, miles: 4, price: 8 });

// An older backend without the fields → no row, legs only.
assert.equal(deadheadFor(trips, [{ price: 1 }, { price: 2 }, { price: 3 }]), null);
assert.equal(estimateTotal([], []), 0);

console.log('iframe deadhead OK');
