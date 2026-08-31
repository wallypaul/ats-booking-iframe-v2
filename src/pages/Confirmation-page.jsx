import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import components
import PaymentCard from '../components/confirnation-components/PaymentCard';
import ProcessingCard from '../components/confirnation-components/ProcessingCard';
import PendingApprovalCard from '../components/confirnation-components/PendingApprovalCard';
import ConfirmedCard from '../components/confirnation-components/ConfirmedCard';
import InvalidBookingIdCard from '../components/confirnation-components/InvalidBookingIdCard';
import InputBookingId from '../components/confirnation-components/InputBookingId';
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
  const [bookingStatus, setBookingStatus] = useState('pending'); // 'pending' | 'payment' | 'processing' | 'confirmed' | 'invalid'
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null); // full booking payload from the API
  const [loading, setLoading] = useState(false);

  const handleCheck = (id, { silent = false } = {}) => {
    setBookingId(id);
    // A background poll leaves the current card on screen. Swapping it for the
    // skeleton every few seconds reads as the page reloading under the user.
    if (!silent) setLoading(true);
      const upperId = id.toUpperCase();
      // Fetch the booking status from the API using the booking ID. Backe expects a GET data in json format like { "bookingId": "12345" }
      
      axios.get(`${API_URL}/api/get-booking/`, { params: { ref: upperId } })
      .then(response => {
        const status = response.data.status; 
        setBooking(response.data); 
        if (response.status === 200) {
          // Checked BEFORE status: a charged booking still sits at 'accepted'
          // until Square's webhook settles it, so without this the card form
          // would come back and invite a second payment for the same trip.
          if (response.data.payment_status === 'processing') {
            setBookingStatus('processing');
          }
          else if (status === 'received') {
            setBookingStatus('pending');

            }
          else if (status === 'accepted') setBookingStatus('payment');
          else if (status === 'deny') setBookingStatus('confirmed');
          else if (status === 'confirmed') setBookingStatus('confirmed');
          else {
            throw new Error(`Unexpected booking status: ${status}`);
            setBookingStatus('invalid');
            return;
          }
          
        }
        else if (response.status !== 200) {
          throw new Error(`Unexpected response status: ${response.status}`);
          setBookingStatus('invalid');
          return;
        }
        else {
          setBookingStatus('invalid');
          return;
        }
      })
      .catch(error => {
        console.error('Error fetching booking status:', error);
        // A 404 (or any failed lookup) means the booking ID was not found
        setBookingStatus('invalid');
      })
      .finally(() => { if (!silent) setLoading(false); });


    // Hardcoded for now — type "payment" or "
    // " in the ID to preview
    // those states; anything else shows "pending".
    // const lowered = id.toLowerCase();
    // if (lowered.includes('payment')) setBookingStatus('payment');
    // else if (lowered.includes('confirmed')) setBookingStatus('confirmed');
    // else setBookingStatus('pending');
  };

  // Square settles a charge out of band, so 'processing' resolves on its own —
  // but only if we ask again. Poll while it settles, stop on any terminal state,
  // and give up after 90s into an instruction rather than an endless spinner.
  const POLL_MS = 4000;
  const GIVE_UP_MS = 90000;
  const settlingSince = useRef(null);
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    if (bookingStatus !== 'processing') {
      settlingSince.current = null;
      setStalled(false);
      return undefined;
    }
    if (settlingSince.current === null) settlingSince.current = Date.now();
    const id = setInterval(() => {
      if (Date.now() - settlingSince.current >= GIVE_UP_MS) {
        setStalled(true);
        clearInterval(id);
        return;
      }
      handleCheck(bookingId, { silent: true });   // re-reads payment_status; flips us out of here
    }, POLL_MS);
    return () => clearInterval(id);
    // handleCheck is stable enough here: it only closes over setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingStatus, bookingId]);

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
                      // The charge went through; the money is not settled yet.
                      // Square's webhook is what makes this 'confirmed'.
                      setBookingStatus(
                        paid?.payment_status === 'paid' ? 'confirmed' : 'processing',
                      );
                    }}
                  />
                )}
                {bookingStatus === 'processing' && (
                  <ProcessingCard booking={booking} stalled={stalled} />
                )}
                {bookingStatus === 'confirmed' && (
                  <ConfirmedCard
                    amount={booking?.payment_status === 'paid' ? booking.amount || booking.total : null}
                  />
                )}
                {bookingStatus === 'invalid' && <InvalidBookingIdCard />}
              </>
            )}
          </Box>
        </Fade>
      )}
    </Shell>
  );
}
