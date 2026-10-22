import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import components
import PaymentCard from '../components/confirnation-components/PaymentCard';
import PendingApprovalCard from '../components/confirnation-components/PendingApprovalCard';
import ConfirmedCard from '../components/confirnation-components/ConfirmedCard';
import InvalidBookingIdCard from '../components/confirnation-components/InvalidBookingIdCard';
import InputBookingId from '../components/confirnation-components/InputBookingId';
import DenyCard from '../components/confirnation-components/DenyCard';
import { cardFor } from '../bookingCard';
import { Shell } from './App';
import axios from 'axios';
import { API_URL } from '../config';

// Neutral placeholder shaped like StatusCard, shown while the lookup is in flight.
function StatusCardSkeleton() {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Skeleton variant="rectangular" height={4} />
      <Box sx={{ p: { xs: 3, sm: 3.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={52} height={52} sx={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rounded" width={120} height={20} sx={{ mb: 0.75 }} />
            <Skeleton variant="text" width="55%" sx={{ fontSize: '1.05rem' }} />
          </Box>
        </Box>
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="92%" />
        <Skeleton variant="text" width="68%" />
      </Box>
    </Box>
  );
}

export default function ConfirmationPage() {
  const [bookingStatus, setBookingStatus] = useState('pending'); // see cardFor in bookingCard.js
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null); // full booking payload from the API
  const [loading, setLoading] = useState(false);

  const handleCheck = (id) => {
    setBookingId(id);
    setLoading(true);
      const upperId = id.toUpperCase();
      // Fetch the booking status from the API using the booking ID. Backe expects a GET data in json format like { "bookingId": "12345" }
      
      axios.get(`${API_URL}/api/get-booking/`, { params: { ref: upperId } })
      .then(response => {
        setBooking(response.data);
        // Payment first, then status - see bookingCard.js for why.
        setBookingStatus(cardFor(response.data));
      })
      .catch(error => {
        console.error('Error fetching booking status:', error);
        // A 404 (or any failed lookup) means the booking ID was not found
        setBookingStatus('invalid');
      })
      .finally(() => setLoading(false));


    // Hardcoded for now — type "payment" or "
    // " in the ID to preview
    // those states; anything else shows "pending".
    // const lowered = id.toLowerCase();
    // if (lowered.includes('payment')) setBookingStatus('payment');
    // else if (lowered.includes('confirmed')) setBookingStatus('confirmed');
    // else setBookingStatus('pending');
  };

  const handleReset = () => {
    setBookingId('');
    setBooking(null);
    setLoading(false);
  };

  return (
    <Shell>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Check your booking
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track the status of your reservation in a few seconds.
      </Typography>

      {!bookingId ? (
        <Fade in timeout={350}>
          <Box>
            <InputBookingId onCheck={handleCheck} />
          </Box>
        </Fade>
      ) : (
        <Fade in timeout={350}>
          <Box>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}
            >
              <Typography variant="body2" color="text.secondary">
                Booking ID:{' '}
                <Box component="strong" sx={{ color: 'text.primary' }}>
                  {bookingId}
                </Box>
              </Typography>
              <Button
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={handleReset}
                sx={{ color: 'text.secondary' }}
              >
                Check another
              </Button>
            </Stack>

            {loading ? (
              <StatusCardSkeleton />
            ) : (
              <>
                {bookingStatus === 'pending' && <PendingApprovalCard booking={booking} />}
                {bookingStatus === 'payment' && (
                  <PaymentCard
                    booking={booking}
                    onPaid={(paid) => {
                      setBooking((b) => ({ ...b, ...paid }));
                      setBookingStatus('confirmed');
                    }}
                  />
                )}
                {bookingStatus === 'confirmed' && (
                  <ConfirmedCard
                    amount={booking?.payment_status === 'paid' ? booking.amount || booking.total : null}
                    bookingRef={booking?.ref || bookingId}
                  />
                )}
                {bookingStatus === 'denied' && <DenyCard />}
                {bookingStatus === 'invalid' && <InvalidBookingIdCard />}
              </>
            )}
          </Box>
        </Fade>
      )}
    </Shell>
  );
}
