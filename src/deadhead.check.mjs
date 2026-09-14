// Deadhead is a booking-level charge: only the leg that runs first pays it, and it
// is shown as its own line — never inside a leg's price. Run: node src/deadhead.check.mjs
import assert from 'node:assert/strict';
import { deadheadFor, estimateTotal } from './deadhead.js';

const trips = [
  { date: '2026-09-16', time: '09:00' },   // A
  { date: '2026-09-15', time: '14:30' },   // B — earliest
  { date: '2026-09-17', time: '08:00' },   // C
];
const prices = trips.map(() => ({ price: 37.5, deadhead_miles: '4', deadhead_price: '8.00' }));

assert.deepEqual(deadheadFor(trips, prices), { index: 1, miles: '4', price: 8 });
assert.equal(estimateTotal(trips, prices), 120.5, '3 legs + one deadhead');

// Same day: time decides.
assert.equal(deadheadFor(
  [{ date: '2026-09-15', time: '16:00' }, { date: '2026-09-15', time: '06:00' }], prices).index, 1);

// Payer with no base → zero deadhead → no row.
const noBase = prices.map((p) => ({ ...p, deadhead_price: '0' }));
assert.equal(deadheadFor(trips, noBase), null);
assert.equal(estimateTotal(trips, noBase), 112.5);

// An older backend without the fields → no row, legs only.
assert.equal(deadheadFor(trips, [{ price: 1 }, { price: 2 }, { price: 3 }]), null);
assert.equal(estimateTotal([], []), 0);

console.log('iframe deadhead OK');
