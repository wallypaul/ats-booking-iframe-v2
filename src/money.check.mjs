// The bug this guards: the API sends prices as Decimal strings ("66.00"), so
// the multi-trip total did `0 + "66.00" + "66.00"` and rendered "$066.0066.00"
// instead of "$132.00".
//
// Run: node src/money.check.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { toAmount, formatAmount, preferred } from './money.js';

const sum = (prices) => formatAmount(prices.reduce((s, p) => s + toAmount(p), 0));

assert.equal(sum(['66.00', '66.00']), '132.00', 'string prices must add, not concatenate');
assert.equal(sum([66, 66]), '132.00');
assert.equal(sum(['66.00', 66]), '132.00');
assert.equal(sum(['0.10', '0.20']), '0.30', 'float noise must not reach the display');
assert.equal(sum([]), '0.00');
assert.equal(sum([undefined, null, '', 'n/a', '66.00']), '66.00', 'missing prices count as 0');
assert.equal(formatAmount('66'), '66.00', 'display keeps cents');

// Confirmation must run every price through these, never bare `+`.
// The total itself is now computed by deadhead.js's estimateTotal (it folds in
// the deadhead charge too), which must coerce each price before adding.
const conf = readFileSync(new URL('./components/Confirmation.jsx', import.meta.url), 'utf8');
assert.ok(!/sum \+ \(?p\.price/.test(conf), 'the total must coerce each price before adding');
assert.match(conf, /estimateTotal\(tripsData, tripPrices\)/);

const deadhead = readFileSync(new URL('./deadhead.js', import.meta.url), 'utf8');
assert.match(deadhead, /reduce\(\(sum, p\) => sum \+ toAmount\(p\?\.price\), 0\)/);

// ...and the prices in state must already be numbers, from the API boundary.
// That boundary is now the ONE itinerary call, not a quote per leg — the per-day
// deadhead rule needs every leg's date at once — so the coercion moved with it.
const app = readFileSync(new URL('./pages/App.jsx', import.meta.url), 'utf8');
assert.match(app, /price: toAmount\(p\.price\)/,
  'App must coerce price where the itinerary response enters the app');
assert.match(app, /distance\/iframe\/itinerary\//,
  'pricing must go through the itinerary endpoint, or deadhead is not per-day');

// preferred(): present-vs-absent, not truthiness. A backend without
// `legs_miles` once rendered "Trip mileage 0.00 mi" beside a correct total,
// because "an itinerary came back" was read as "every key on it is present".
assert.equal(preferred(undefined, () => 42.8), 42.8, 'a missing key falls back');
assert.equal(preferred(null, () => 42.8), 42.8, 'null falls back too');
assert.equal(preferred('42.80', () => 0), 42.8, 'a present value wins');
assert.equal(preferred('0', () => 99), 0, 'a real zero is an answer, not a gap');
assert.equal(preferred(0, () => 99), 0);

console.log('money math OK');
