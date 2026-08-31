import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import StatusCard from './StatusCard';

/**
 * The card was charged and Square has not confirmed it yet.
 *
 * Its whole job is to NOT be the payment card. A charged booking still sits at
 * status 'accepted' until the webhook settles it, so without this state a
 * re-check of the booking id would show the card form again and invite a second
 * payment for the same trip.
 */
export default function ProcessingCard({ booking }) {
  return (
    <StatusCard
      icon={<HourglassTopOutlinedIcon />}
      color="secondary"
      statusLabel="Payment processing"
      title="Payment received"
      description={
        booking?.amount || booking?.total
          ? `We've taken $${booking.amount || booking.total} and are confirming it with your bank. This usually takes a moment. You'll get a confirmation email with your itinerary and receipt as soon as it clears — there's nothing more to do, and please don't pay again.`
          : "We've taken your payment and are confirming it with your bank. This usually takes a moment. You'll get a confirmation email with your itinerary and receipt as soon as it clears — there's nothing more to do, and please don't pay again."
      }
    />
  );
}
