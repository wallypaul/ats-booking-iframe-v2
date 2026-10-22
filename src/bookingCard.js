// Which card the rider sees for a looked-up booking.
//
// Payment decides first. Only Square's settlement ever sets a booking to
// `confirmed`; a payment the office records, or a charge Square has not
// settled yet, leaves the booking `accepted`. Reading the status alone sent
// those riders back to the payment form - where paying again is refused -
// and they never reached their trip statuses.
//
// `processing` counts as paid here because the payment form already treats it
// that way: the moment a charge is submitted it moves the rider on to the
// confirmed view, and a later lookup has to agree with that.
const PAID = ['paid', 'processing', 'waived', 'completed'];

/** @returns {'pending'|'payment'|'confirmed'|'denied'|'invalid'} */
export function cardFor(booking) {
  if (!booking) return 'invalid';
  if (PAID.includes(booking.payment_status) || booking.status === 'confirmed') return 'confirmed';
  switch (booking.status) {
    // dispatch_failed is dispatch's own "awaiting review", same as received.
    case 'received':
    case 'dispatch_failed':
      return 'pending';
    case 'accepted':
      return 'payment';
    // A finished booking has run, so its trips are worth showing.
    case 'completed':
      return 'confirmed';
    case 'rejected':
    case 'cancelled':
      return 'denied';
    default:
      return 'invalid';
  }
}
