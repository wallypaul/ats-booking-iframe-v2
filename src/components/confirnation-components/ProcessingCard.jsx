import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import StatusCard from './StatusCard';

/**
 * The card was charged and Square has not confirmed it yet.
 *
 * Two jobs. It must NOT be the payment card — a charged booking still sits at
 * status 'accepted' until the webhook settles it, so without this state a
 * re-check would show the card form again and invite a second payment for the
 * same trip. And it must not claim the booking is confirmed: the money has left
 * the card but the bank has not confirmed it, and someone told their medical
 * ride is booked when it is not will act on that.
 *
 * `stalled` is the end of a bounded wait. A spinner that never resolves reads
 * as a broken site, and the honest answer at that point is a phone number.
 */
export default function ProcessingCard({ booking, stalled = false }) {
  const amount = booking?.amount || booking?.total;

  if (stalled) {
    return (
      <StatusCard
        icon={<PhoneInTalkOutlinedIcon />}
        color="secondary"
        statusLabel="Still checking"
        title="This is taking longer than usual"
        description={
          `Your card was charged${amount ? ` $${amount}` : ''} and we still haven't had ` +
          'confirmation back. Your money is not lost. Please call us and we\'ll confirm ' +
          'your booking with you — and please don\'t pay again.'
        }
      />
    );
  }

  return (
    <StatusCard
      icon={<HourglassTopOutlinedIcon />}
      color="secondary"
      statusLabel="Payment received"
      title="Confirming your payment"
      description={
        `We've taken${amount ? ` $${amount}` : ' your payment'} and are waiting for your bank ` +
        'to confirm it, which usually takes a few seconds. This page checks on its own — ' +
        'there\'s nothing more to do, and please don\'t pay again. You\'ll get a confirmation ' +
        'email with your itinerary and receipt as soon as it clears.'
      }
    />
  );
}
