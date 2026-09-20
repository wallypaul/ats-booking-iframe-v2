// The bug this guards: the date floor used the BROWSER's local day and the time
// had no floor at all, so a trip could be booked in the past — or, from another
// timezone, on the wrong New York day. Run: node src/nyTime.check.mjs
import assert from 'node:assert/strict';
import { nyNow, minTimeFor, isPastInNY, HHMM } from './nyTime.js';

// 03:30 UTC on 14 Sep is still 23:30 on the 13th in New York (EDT, UTC-4).
const lateSummer = new Date('2026-09-14T03:30:00Z');
assert.deepEqual(nyNow(lateSummer), { date: '2026-09-13', time: '23:30' });

// Winter is EST (UTC-5): 05:00 UTC is midnight in New York.
assert.deepEqual(nyNow(new Date('2026-01-15T05:00:00Z')), { date: '2026-01-15', time: '00:00' });

// The time floor only applies on New York's today.
assert.equal(minTimeFor('2026-09-13', lateSummer), '23:30');
assert.equal(minTimeFor('2026-09-14', lateSummer), undefined);

assert.equal(isPastInNY('2026-09-13', '23:29', lateSummer), true);
assert.equal(isPastInNY('2026-09-13', '23:30', lateSummer), false, 'this minute is bookable');
assert.equal(isPastInNY('2026-09-14', '00:00', lateSummer), false);
assert.equal(isPastInNY('2026-09-12', '23:59', lateSummer), true, 'yesterday');
assert.equal(isPastInNY('2026-09-13', '23:29:00', lateSummer), true, 'HH:MM:SS is compared on HH:MM');

assert.ok(HHMM.test('09:05') && HHMM.test('23:59'));
assert.ok(!HHMM.test('24:00') && !HHMM.test('9:05') && !HHMM.test('09:60'));

console.log('nyTime OK');
