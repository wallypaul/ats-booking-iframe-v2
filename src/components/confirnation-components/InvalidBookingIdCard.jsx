import Typography from '@mui/material/Typography';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import StatusCard from './StatusCard';

export default function InvalidBookingIdCard() {
  return (
    <StatusCard
      icon={<SearchOffOutlinedIcon />}
      color="error"
      statusLabel="Invalid booking ID"
      title="Booking not found"
      description="The booking ID you entered is not valid. Please check the ID and try again."
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Need to make a change? Reach our support team and we'll be happy to
        help.
      </Typography>
    </StatusCard>
  );
}
