import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import components
import PaymentCard from '../components/confirnation-components/PaymentCard';
import PendingApprovalCard from '../components/confirnation-components/PendingApprovalCard';
import ConfirmedCard from '../components/confirnation-components/ConfirmedCard';
import InvalidBookingIdCard from '../components/confirnation-components/InvalidBookingIdCard';
import InputBookingId from '../components/confirnation-components/InputBookingId';
import { Shell } from './App';
import axios from 'axios'; 
// Get the variable form VITE_API_URL in .env file
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ConfirmationPage() {
  const [bookingStatus, setBookingStatus] = useState('pending'); // 'pending' | 'payment' | 'confirmed' | 'invalid'
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null); // full booking payload from the API

  const handleCheck = (id) => {
    setBookingId(id);
      const upperId = id.toUpperCase();
      // Fetch the booking status from the API using the booking ID. Backe expects a GET data in json format like { "bookingId": "12345" }
      
      axios.get(`${API_URL}/api/get-booking/`, { params: { ref: upperId } })
      .then(response => {
        const status = response.data.status; 
        setBooking(response.data); 
        if (response.status === 200) {
          if (status === 'received') {
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
      });


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

            {bookingStatus === 'pending' && <PendingApprovalCard booking={booking} />}
            {bookingStatus === 'payment' && <PaymentCard />}
            {bookingStatus === 'confirmed' && <ConfirmedCard />}
            {bookingStatus === 'invalid' && <InvalidBookingIdCard />}
          </Box>
        </Fade>
      )}
    </Shell>
  );
}
