// Run: node src/bookingCard.test.mjs
import assert from 'node:assert';
import { cardFor } from './bookingCard.js';

const b = (status, payment_status = 'pending') => ({ status, payment_status });

// Paid by any route reaches the trip status view, whatever the status says.
assert.equal(cardFor(b('confirmed', 'paid')), 'confirmed');   // Square settled
assert.equal(cardFor(b('accepted', 'paid')), 'confirmed');    // office recorded it
assert.equal(cardFor(b('accepted', 'waived')), 'confirmed');
assert.equal(cardFor(b('accepted', 'processing')), 'confirmed'); // charge not settled yet
assert.equal(cardFor(b('cancelled', 'paid')), 'confirmed');   // trips will read "cancelled"

// Not paid yet.
assert.equal(cardFor(b('received')), 'pending');
assert.equal(cardFor(b('dispatch_failed')), 'pending');
assert.equal(cardFor(b('accepted')), 'payment');
assert.equal(cardFor(b('accepted', 'failed')), 'payment');   // a failed charge can be retried

// Closed by the office: never "invalid booking ID" for a real booking.
assert.equal(cardFor(b('completed')), 'confirmed');
assert.equal(cardFor(b('rejected')), 'denied');
assert.equal(cardFor(b('cancelled')), 'denied');

// Nothing recognisable.
assert.equal(cardFor(null), 'invalid');
assert.equal(cardFor(b('something_new')), 'invalid');

console.log('bookingCard: all assertions passed');
