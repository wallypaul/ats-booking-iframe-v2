import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import StatusCard from './StatusCard';
import { API_URL, ATS } from '../../config';

// Square Web Payments SDK — a different script host per environment.
const SDK_URL = {
  production: 'https://web.squarecdn.com/v1/square.js',
  sandbox: 'https://sandbox.web.squarecdn.com/v1/square.js',
};

// Injected lazily, only when the payer actually has a Square config.
let sdkPromise;
function loadSquareSdk(environment) {
  if (window.Square) return Promise.resolve();
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SDK_URL[environment] || SDK_URL.production;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return sdkPromise;
}

export default function PaymentCard({ booking, onPaid }) {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const [state, setState] = useState('loading'); // 'loading' | 'ready' | 'no-config' | 'error'
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  // A 502 means the charge MAY have gone through. Re-enabling the button is how
  // someone pays twice for one trip, so this latches the form off for good.
  const [unconfirmed, setUnconfirmed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // The payer's public Square fields (application_id, location_id, environment)
    // ride on the services call, resolved server-side from this iframe's uuid.
    axios
      .get(`${API_URL}/api/v2/iframe/${ATS.iframeUuid}/services/`)
      .then(async ({ data }) => {
        if (!data.square) {
          if (!cancelled) setState('no-config');
          return;
        }
        await loadSquareSdk(data.square.environment);
        if (cancelled) return;
        const payments = window.Square.payments(data.square.application_id, data.square.location_id);
        const card = await payments.card();
        if (cancelled) {
          card.destroy();
          return;
        }
        await card.attach(containerRef.current);
        cardRef.current = card;
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
      cardRef.current?.destroy();
    };
  }, []);

  const handlePay = async () => {
    setPaying(true);
    setPayError('');
    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== 'OK') {
        throw new Error(result.errors?.[0]?.message || 'Card details are incomplete or invalid.');
      }
      // Amount is computed server-side from the booking's trips; only the ref
      // and the card token leave the browser.
      const { data } = await axios.post(`${API_URL}/api/v2/iframe/${ATS.iframeUuid}/pay/`, {
        ref: booking?.ref,
        source_id: result.token,
      });
      onPaid?.(data); // {ref, status, payment_status: 'processing', amount}
    } catch (e) {
      // 402 = declined (Square's reason, safe to retry with another card),
      // 400 = not payable, 502 = we never got an answer from Square.
      // All three come back as {error}.
      if (e.response?.status === 502) setUnconfirmed(true);
      setPayError(e.response?.data?.error || e.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  // Payer takes payments offline — approved booking, no payment UI at all.
  if (state === 'no-config') {
    return (
      <StatusCard
        icon={<CreditCardOutlinedIcon />}
        color="secondary"
        statusLabel="Approved"
        title="Your booking has been approved"
        description="We'll be in touch to arrange payment and confirm your reservation."
      />
    );
  }

  // booking.total is the server-computed sum from the lookup — never client math.
  const amountLabel = booking?.total ? `Pay $${booking.total} securely` : 'Pay securely';

  return (
    <StatusCard
      icon={<CreditCardOutlinedIcon />}
      color="secondary"
      statusLabel="Payment required"
      title="Complete your payment"
      description="Your booking has been approved. Please complete payment to confirm your reservation. You'll receive a confirmation email with your itinerary and receipt once payment is successful."
    >
      {state === 'error' ? (
        <Alert severity="warning">Payment is unavailable right now. Please try again later.</Alert>
      ) : (
        <>
          {state === 'loading' && <Skeleton variant="rounded" height={44} sx={{ mb: 2 }} />}
          {/* Square card form attaches here; must be in the DOM before 'ready'.
              Hidden once unconfirmed — offering a card again would risk a
              second charge for a payment that may already have landed. */}
          <Box
            ref={containerRef}
            sx={{ display: state === 'ready' && !unconfirmed ? 'block' : 'none', mb: 2 }}
          />
          {payError && (
            <Alert severity={unconfirmed ? 'warning' : 'error'} sx={{ mb: 2 }}>
              {payError}
            </Alert>
          )}
          {!unconfirmed && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={paying ? <CircularProgress size={16} color="inherit" /> : <LockOutlinedIcon />}
              onClick={handlePay}
              disabled={state !== 'ready' || paying}
              fullWidth
            >
              {paying ? 'Processing…' : amountLabel}
            </Button>
          )}
        </>
      )}
    </StatusCard>
  );
}
