// The bug this guards: the trip form's draft lives in TripsStep, but Continue
// lives in App. An open, filled form (worst case: Add Return Trip, which opens
// pre-filled and looks saved) was never committed, so the trip was neither
// priced nor submitted — silently, with no error anywhere.
//
// No DOM/renderer in this project, so this checks the wiring that carries it:
// App must commit through the ref and price the array commit() returns, not the
// tripsData state it saw before the save (setTripsData is async).
//
// Run: node src/components/TripsStep.check.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const trips = readFileSync(new URL('./TripsStep.jsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../pages/App.jsx', import.meta.url), 'utf8');

assert.match(trips, /useImperativeHandle\(ref, \(\) => \(\{\s*commit:/,
  'TripsStep must expose commit() so the parent can save the open form');
assert.match(trips, /return saveTrip\(\);/,
  'commit() must return saveTrip()s array (or null) — the parent needs both');
assert.match(trips, /if \(!validate\(\)\) return null;/,
  'saveTrip must return null when incomplete, so Continue blocks instead of dropping the trip');
assert.match(trips, /return next;/, 'saveTrip must return the new trips array');

assert.match(app, /<TripsStep ref=\{tripsFormRef\}/, 'App must hold the TripsStep ref');
assert.match(app, /tripsFormRef\.current\.commit\(\)[\s\S]{0,80}if \(!trips\) return;/,
  'Continue must commit the open form and bail when it is incomplete');

// The stale-state trap: pricing and the priced payload must both use the
// committed array. `trips.map`, never `tripsData.map`.
const step2 = app.slice(app.indexOf('if (activeStep === 2)'), app.indexOf('const handleBack'));
assert.ok(!/tripsData\.map|addTripPricesToTrips\(tripsData/.test(step2),
  'step 2 must price the committed array (trips), not the pre-save tripsData state');

console.log('TripsStep commit-on-continue wiring OK');
