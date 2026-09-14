import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import StatusCard from './StatusCard';

export default function DenyCard() {
  return (
    <StatusCard
      icon={<CheckCircleOutlineIcon />}
      color="secondary"
      statusLabel="Denied"
      title="Can't make it this time"
      description="Unfortunately, we could not get for you a ride this time. If you have any questions, please contact our support team."
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        We understand that this is disappointing news, and we sincerely apologize
        for any inconvenience this may have caused. Our team is here to assist youß
        with any questions or concerns you may have regarding your booking or
        future reservations. Please don't hesitate to reach out to our support team at 603-290-4979, and we'll do our
        best to help you.
      </Typography>
    </StatusCard>
  );
}
