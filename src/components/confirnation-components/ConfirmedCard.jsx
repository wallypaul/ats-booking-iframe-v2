import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import StatusCard from './StatusCard';

export default function ConfirmedCard() {
  return (
    <StatusCard
      icon={<CheckCircleOutlineIcon />}
      color="secondary"
      statusLabel="Confirmed"
      title="Your booking is confirmed"
      description="You're all set! A confirmation email with your full itinerary has been sent. Please keep your booking ID handy for the day of your trip."
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Our driver will arrive at the scheduled pickup time. We look forward to
        serving you.
      </Typography>
    </StatusCard>
  );
}
