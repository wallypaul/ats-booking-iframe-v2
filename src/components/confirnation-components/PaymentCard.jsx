import Button from '@mui/material/Button';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import StatusCard from './StatusCard';

export default function PaymentCard({ amount, onPay }) {
  return (
    <StatusCard
      icon={<CreditCardOutlinedIcon />}
      color="secondary"
      statusLabel="Payment required"
      title="Complete your payment"
      description="Your booking has been approved. Please complete payment to confirm your reservation. You'll receive a confirmation email with your itinerary and receipt once payment is successful."
    >
      <Button
        variant="contained"
        color="secondary"
        startIcon={<LockOutlinedIcon />}
        onClick={onPay}
        fullWidth
      >
        {amount ? `Pay ${amount} securely` : 'Pay securely'}
      </Button>
    </StatusCard>
  );
}
