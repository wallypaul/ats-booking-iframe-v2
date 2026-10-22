// Run: node src/nyTime.test.mjs
import assert from 'node:assert';
import { tripWhen } from './nyTime.js';

assert.equal(tripWhen('2099-09-01', '09:00:00'), '09/01/2099 · 09:00 am');
assert.equal(tripWhen('2099-09-01', '15:30'), '09/01/2099 · 03:30 pm');
// The two the 12-hour clock gets wrong.
assert.equal(tripWhen('2099-09-01', '00:05'), '09/01/2099 · 12:05 am');
assert.equal(tripWhen('2099-09-01', '12:00'), '09/01/2099 · 12:00 pm');
// A missing part leaves the other, never 'undefined' or 'NaN'.
assert.equal(tripWhen('2099-09-01', null), '09/01/2099');
assert.equal(tripWhen(null, '09:00'), '09:00 am');
assert.equal(tripWhen(null, null), '');

console.log('nyTime: all assertions passed');
