import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import FactCheckIcon from '@mui/icons-material/FactCheckOutlined';
import StatusCard from './StatusCard';
import TrackTripCard from './TrackTripCard';

export default function ConfirmedCard({ amount, bookingRef }) {
  const [tracking, setTracking] = useState(false);

  if (tracking && bookingRef) {
    return <TrackTripCard bookingRef={bookingRef} />;
  }

  return (
    <StatusCard
      icon={<CheckCircleOutlineIcon />}
      color="secondary"
      statusLabel="Confirmed"
      title="Your booking is confirmed"
      description="You're all set! A confirmation email with your full itinerary has been sent. Please keep your booking ID handy for the day of your trip."
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {amount ? `Payment of $${amount} received. ` : ''}Our driver will arrive
        at the scheduled pickup time. We look forward to serving you.
      </Typography>

      {bookingRef && (
        <Box sx={{ mt: 2.5 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<FactCheckIcon />}
            onClick={() => setTracking(true)}
            sx={{ py: 1.5 }}
          >
            Check trip status
          </Button>
        </Box>
      )}
    </StatusCard>
  );
}
