import Typography from '@mui/material/Typography';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import StatusCard from './StatusCard';

export default function PendingApprovalCard({ booking }) {
  const firstName = booking?.firstName ?? '';
  const lastName = booking?.lastName ?? '';
  const phone = booking?.phone_1 ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  const greeting = fullName ? `Hey ${fullName},` : 'Hey,';
  const description = `we've received your trip request and our team is now checking whether we can make it happen. We'll let you know within 12 hours${
    phone ? `, with a notification sent to ${phone},` : ''
  } once your trip is approved.`;

  return (
    <StatusCard
      icon={<PendingActionsOutlinedIcon />}
      color="primary"
      statusLabel="Pending approval"
      title={greeting}
      description={description}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Need to make a change? Reach our support team and we'll be happy to
        help.
      </Typography>
    </StatusCard>
  );
}
